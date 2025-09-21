import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useSendApproveTransaction,
  useSendDepositTransaction,
  useTokenAllowance,
  useUserVaultTokenBalance,
  useVaultBalance
} from '@generationsoftware/hyperstructure-react-hooks'
import classNames from 'classnames'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { useEffect, useState, useRef, useMemo } from 'react'
import { Loading } from '@components/Loading'

interface VaultDepositButtonProps {
  vault: Vault
  className?: string
  onDepositAmountChange?: () => void
}

export const VaultDepositButton = (
  props: VaultDepositButtonProps & {
    depositAmount: bigint
    disabled?: boolean
    onSuccess?: () => void
  }
) => {
  const { vault, depositAmount, disabled, onSuccess, className, onDepositAmountChange } = props
  const [isLoading, setIsLoading] = useState(false)

  const { address: userAddress } = useAccount()

  const { data: token, refetch: refetchVaultBalance } = useVaultBalance(vault)
  const { refetch: refetchUserVaultBalance } = useUserVaultTokenBalance(
    vault,
    userAddress as Address
  )

  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(
    vault.chainId,
    userAddress as Address,
    vault.address,
    token?.address as Address
  )

  // Add detailed logging for allowance check
  console.log('Allowance check details:', {
    chainId: vault.chainId,
    userAddress,
    vaultAddress: vault.address,
    tokenAddress: token?.address,
    allowance,
    isAllowanceUndefined: allowance === undefined,
    isAllowanceZero: allowance === 0n,
    isAllowanceLessThanDeposit: allowance !== undefined && allowance < depositAmount,
    depositAmount
  })

  // Refs for latest values
  const depositAmountRef = useRef(depositAmount)
  const userAddressRef = useRef(userAddress)
  const tokenAddressRef = useRef(token?.address)
  const refetchAllowanceRef = useRef(refetchAllowance)
  const onDepositAmountChangeRef = useRef(onDepositAmountChange)

  useEffect(() => { depositAmountRef.current = depositAmount }, [depositAmount])
  useEffect(() => { userAddressRef.current = userAddress }, [userAddress])
  useEffect(() => { tokenAddressRef.current = token?.address }, [token?.address])
  useEffect(() => { refetchAllowanceRef.current = refetchAllowance }, [refetchAllowance])
  useEffect(() => { onDepositAmountChangeRef.current = onDepositAmountChange }, [onDepositAmountChange])

  const isApproveEnabled = !!token?.address && !!userAddress && !!depositAmount && depositAmount > 0n && (!allowance || allowance < depositAmount)

  // Log dependencies for approve hook
  console.log('Approve hook dependencies', {
    chainId: vault.chainId,
    chainIdType: typeof vault.chainId,
    chainIdBigInt: BigInt(vault.chainId),
    tokenAddress: token?.address,
    vaultAddress: vault.address,
    depositAmount,
    userAddress,
    allowance,
    enabled: isApproveEnabled,
    isApproveEnabled: {
      hasTokenAddress: !!token?.address,
      hasUserAddress: !!userAddress,
      hasDepositAmount: !!depositAmount,
      isDepositAmountPositive: depositAmount > 0n,
      needsApproval: !allowance || allowance < depositAmount
    }
  })

  const isDepositEnabled = !!token?.address && !!userAddress && !!depositAmount && depositAmount > 0n && !!allowance && allowance >= depositAmount

  const approveTx = useSendApproveTransaction(
    BigInt(vault.chainId),
    token?.address as Address,
    {
      enabled: isApproveEnabled,
      onSuccess: () => {
        console.log('DepositButton: Approve transaction success')
        refetchAllowance()
        setIsLoading(false)
      },
      onError: (error) => {
        console.log('DepositButton: Approve transaction error', error)
        setIsLoading(false)
      }
    }
  )

  const sendApproveTransaction = approveTx.sendApproveTransaction

  const { sendDepositTransaction } = useSendDepositTransaction(depositAmount ?? 0n, vault, {
    enabled: isDepositEnabled,
    onSuccess: () => {
      console.log('DepositButton: Deposit transaction success')
      refetchVaultBalance()
      refetchUserVaultBalance()
      onSuccess?.()
      setIsLoading(false)
    },
    onError: (error) => {
      console.log('DepositButton: Deposit transaction error', error)
      setIsLoading(false)
    }
  })

  // Log transaction function details
  console.log('DepositButton transaction functions:', {
    sendApproveTransaction: sendApproveTransaction ? 'available' : 'not available',
    sendDepositTransaction: sendDepositTransaction ? 'available' : 'not available',
    approveFunction: sendApproveTransaction?.toString(),
    depositFunction: sendDepositTransaction?.toString(),
    requiredData: {
      tokenAddress: token?.address,
      userAddress,
      depositAmount,
      hasToken: !!token,
      hasUserAddress: !!userAddress,
      hasDepositAmount: !!depositAmount,
      isDepositAmountPositive: depositAmount > 0n,
      allowance,
      needsApproval: !allowance || allowance < depositAmount,
      approveEnabled: !!token?.address && !!userAddress && !!depositAmount && depositAmount > 0n && (!allowance || allowance < depositAmount)
    }
  })

  useEffect(() => {
    let isProcessing = false
    let timeoutId: NodeJS.Timeout

    const handleDepositAmountChanged = () => {
      console.log('DepositButton: Received depositAmountChanged event')
      if (
        !isProcessing &&
        depositAmountRef.current > 0n &&
        userAddressRef.current &&
        tokenAddressRef.current
      ) {
        isProcessing = true
        setIsLoading(true)
        console.log('DepositButton: Refetching allowance')
        refetchAllowanceRef.current()
        if (onDepositAmountChangeRef.current) onDepositAmountChangeRef.current()
        // Reset processing flag after a short delay to prevent rapid refetches
        timeoutId = setTimeout(() => {
          isProcessing = false
          setIsLoading(false)
        }, 1000)
      }
    }

    window.addEventListener('depositAmountChanged', handleDepositAmountChanged)
    return () => {
      window.removeEventListener('depositAmountChanged', handleDepositAmountChanged)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const buttonClassName =
    'px-4 py-2 bg-pt-teal-dark text-pt-purple-900 rounded select-none disabled:opacity-50 disabled:pointer-events-none text-lg font-medium'

  console.log('DepositButton state:', {
    depositAmount,
    userAddress,
    token,
    allowance,
    isLoading,
    disabled,
    hasSendApproveTransaction: !!sendApproveTransaction,
    hasSendDepositTransaction: !!sendDepositTransaction,
    needsApproval: !allowance || allowance < depositAmount
  })

  if (!depositAmount || !userAddress || !token) {
    console.log('DepositButton: Missing required data')
    return (
      <button className={classNames(buttonClassName, className)} disabled={true}>
        Deposit
      </button>
    )
  }

  if (allowance === undefined) {
    console.log('DepositButton: Allowance undefined')
    return (
      <button className={classNames(buttonClassName, className)} disabled={true}>
        <Loading className="h-4" />
      </button>
    )
  }

  if (!allowance || allowance < depositAmount) {
    console.log('DepositButton: Need approval', {
      allowance,
      depositAmount,
      hasSendApproveTransaction: !!sendApproveTransaction,
      disabled,
      isLoading,
      sendApproveTransaction: sendApproveTransaction?.toString()
    })
    return (
      <button
        type='submit'
        onClick={() => {
          console.log('DepositButton: Starting approve transaction')
          setIsLoading(true)
          sendApproveTransaction?.()
        }}
        disabled={!sendApproveTransaction || disabled || isLoading}
        className={classNames(buttonClassName, className)}
      >
        {isLoading ? <Loading className="h-4 mr-2 inline" /> : null}
        {isLoading ? 'Approving...' : 'Approve'}
      </button>
    )
  }

  console.log('DepositButton: Ready to deposit')
  return (
    <button
      type='submit'
      onClick={() => {
        console.log('DepositButton: Starting deposit transaction')
        setIsLoading(true)
        sendDepositTransaction?.()
      }}
      disabled={!sendDepositTransaction || disabled || isLoading}
      className={classNames(buttonClassName, className)}
    >
      {isLoading ? <Loading className="h-4 mr-2 inline" /> : null}
      {isLoading ? 'Depositing...' : 'Deposit'}
    </button>
  )
}
