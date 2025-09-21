import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useSendWithdrawTransaction,
  useUserVaultTokenBalance,
  useVaultBalance
} from '@generationsoftware/hyperstructure-react-hooks'
import classNames from 'classnames'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { useEffect, useState, useRef } from 'react'
import { Loading } from '@components/Loading'

interface VaultWithdrawButtonProps {
  vault: Vault
  className?: string
}

export const VaultWithdrawButton = (
  props: VaultWithdrawButtonProps & {
    withdrawAmount: bigint
    disabled?: boolean
    onSuccess?: () => void
  }
) => {
  const { vault, withdrawAmount, disabled, onSuccess, className } = props
  const [isLoading, setIsLoading] = useState(false)

  const { address: userAddress } = useAccount()

  const { data: token, refetch: refetchVaultBalance } = useVaultBalance(vault)
  const { refetch: refetchUserVaultBalance } = useUserVaultTokenBalance(
    vault,
    userAddress as Address
  )

  // Refs for latest values
  const withdrawAmountRef = useRef(withdrawAmount)
  const userAddressRef = useRef(userAddress)
  const tokenRef = useRef(token)
  const refetchVaultBalanceRef = useRef(refetchVaultBalance)
  const refetchUserVaultBalanceRef = useRef(refetchUserVaultBalance)
  const onSuccessRef = useRef(onSuccess)

  useEffect(() => { withdrawAmountRef.current = withdrawAmount }, [withdrawAmount])
  useEffect(() => { userAddressRef.current = userAddress }, [userAddress])
  useEffect(() => { tokenRef.current = token }, [token])
  useEffect(() => { refetchVaultBalanceRef.current = refetchVaultBalance }, [refetchVaultBalance])
  useEffect(() => { refetchUserVaultBalanceRef.current = refetchUserVaultBalance }, [refetchUserVaultBalance])
  useEffect(() => { onSuccessRef.current = onSuccess }, [onSuccess])

  // Listen for withdraw amount changes (attach only once)
  useEffect(() => {
    let isProcessing = false

    const handleWithdrawAmountChanged = () => {
      console.log('WithdrawButton: Received withdrawAmountChanged event')
      if (
        !isProcessing &&
        withdrawAmountRef.current > 0n &&
        userAddressRef.current &&
        tokenRef.current
      ) {
        isProcessing = true
        setIsLoading(true)
        console.log('WithdrawButton: Refetching balances')
        // Refetch balances and call onSuccess if needed
        refetchVaultBalanceRef.current()
        refetchUserVaultBalanceRef.current()
        if (onSuccessRef.current) onSuccessRef.current()
        // Reset processing flag after a short delay to prevent rapid refetches
        setTimeout(() => {
          isProcessing = false
          setIsLoading(false)
        }, 1000)
      }
    }

    window.addEventListener('withdrawAmountChanged', handleWithdrawAmountChanged)
    return () => {
      window.removeEventListener('withdrawAmountChanged', handleWithdrawAmountChanged)
    }
  }, [])

  const { sendWithdrawTransaction } = useSendWithdrawTransaction(withdrawAmount, vault, {
    enabled: !!token?.address && !!userAddress && !!withdrawAmount && withdrawAmount > 0n && !isLoading,
    onSuccess: () => {
      console.log('WithdrawButton: Withdraw transaction success')
      refetchVaultBalance()
      refetchUserVaultBalance()
      onSuccess?.()
      setIsLoading(false)
    },
    onError: () => {
      console.log('WithdrawButton: Withdraw transaction error')
      setIsLoading(false)
    }
  })

  const buttonClassName =
    'px-4 py-2 bg-pt-teal-dark text-pt-purple-900 rounded select-none disabled:opacity-50 disabled:pointer-events-none text-lg font-medium'

  console.log('WithdrawButton state:', {
    withdrawAmount,
    userAddress,
    token,
    isLoading,
    disabled,
    hasSendWithdrawTransaction: !!sendWithdrawTransaction
  })

  if (!withdrawAmount || !userAddress || !token) {
    console.log('WithdrawButton: Missing required data')
    return (
      <button className={classNames(buttonClassName, className)} disabled={true}>
        Withdraw
      </button>
    )
  }

  console.log('WithdrawButton: Ready to withdraw')
  return (
    <button
      type='submit'
      onClick={() => {
        console.log('WithdrawButton: Starting withdraw transaction')
        setIsLoading(true)
        sendWithdrawTransaction()
      }}
      disabled={!sendWithdrawTransaction || disabled || isLoading}
      className={classNames(
        'w-full px-6 py-4 text-lg font-medium rounded-xl transition-colors',
        'disabled:bg-pt-purple-300 disabled:text-pt-purple-200 disabled:cursor-not-allowed',
        'enabled:bg-pt-teal enabled:hover:bg-pt-teal-dark enabled:active:bg-pt-teal-darker',
        'enabled:text-pt-purple-900',
        className
      )}
    >
      {isLoading ? <Loading className='h-6 mr-2 inline' /> : null}Withdraw
    </button>
  )
}
