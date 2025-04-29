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
import { useEffect } from 'react'
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

  // Immediately check allowance when deposit amount or token changes
  useEffect(() => {
    if (depositAmount > 0n && userAddress && token?.address) {
      refetchAllowance()
    }
  }, [depositAmount, userAddress, token?.address, refetchAllowance])

  // Listen for manual allowance check triggers
  useEffect(() => {
    const handleDepositAmountChanged = () => {
      if (depositAmount > 0n && userAddress && token?.address) {
        refetchAllowance()
        onDepositAmountChange?.()
      }
    }

    window.addEventListener('depositAmountChanged', handleDepositAmountChanged)
    return () => {
      window.removeEventListener('depositAmountChanged', handleDepositAmountChanged)
    }
  }, [depositAmount, userAddress, token?.address, refetchAllowance, onDepositAmountChange])

  const { sendApproveTransaction } = useSendApproveTransaction(depositAmount, vault, {
    onSuccess: () => {
      refetchAllowance()
      // Automatically trigger deposit after successful approval
      if (sendDepositTransaction) {
        sendDepositTransaction()
      }
    }
  })

  const { sendDepositTransaction } = useSendDepositTransaction(depositAmount, vault, {
    onSuccess: () => {
      refetchVaultBalance()
      refetchUserVaultBalance()
      onSuccess?.()
    }
  })

  const buttonClassName =
    'px-4 py-2 bg-pt-teal-dark text-pt-purple-900 rounded select-none disabled:opacity-50 disabled:pointer-events-none text-lg font-medium'

  if (!depositAmount || !userAddress || !token) {
    return (
      <button className={classNames(buttonClassName, className)} disabled={true}>
        Deposit
      </button>
    )
  }

  if (allowance === undefined) {
    return (
      <button className={classNames(buttonClassName, className)} disabled={true}>
        <Loading className="h-4" />
      </button>
    )
  }

  if (allowance < depositAmount) {
    return (
      <button
        type='submit'
        onClick={sendApproveTransaction}
        disabled={!sendApproveTransaction || disabled}
        className={classNames(buttonClassName, className)}
      >
        Approve
      </button>
    )
  }

  return (
    <button
      type='submit'
      onClick={sendDepositTransaction}
      disabled={!sendDepositTransaction || disabled}
      className={classNames(buttonClassName, className)}
    >
      Deposit
    </button>
  )
}
