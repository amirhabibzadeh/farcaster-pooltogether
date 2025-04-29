import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useSendWithdrawTransaction,
  useUserVaultTokenBalance,
  useVaultBalance
} from '@generationsoftware/hyperstructure-react-hooks'
import classNames from 'classnames'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'

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

  const { address: userAddress } = useAccount()

  const { data: token, refetch: refetchVaultBalance } = useVaultBalance(vault)
  const { refetch: refetchUserVaultBalance } = useUserVaultTokenBalance(
    vault,
    userAddress as Address
  )

  // Listen for withdraw amount changes
  useEffect(() => {
    const handleWithdrawAmountChanged = () => {
      if (withdrawAmount > 0n && userAddress && token) {
        // Force a re-render to update button state
        window.dispatchEvent(new Event('withdrawAmountChanged'))
      }
    }

    window.addEventListener('withdrawAmountChanged', handleWithdrawAmountChanged)
    return () => {
      window.removeEventListener('withdrawAmountChanged', handleWithdrawAmountChanged)
    }
  }, [withdrawAmount, userAddress, token])

  const { sendWithdrawTransaction } = useSendWithdrawTransaction(withdrawAmount, vault, {
    onSuccess: () => {
      refetchVaultBalance()
      refetchUserVaultBalance()
      onSuccess?.()
    }
  })

  const buttonClassName =
    'px-4 py-2 bg-pt-teal-dark text-pt-purple-900 rounded select-none disabled:opacity-50 disabled:pointer-events-none text-lg font-medium'

  if (!withdrawAmount || !userAddress || !token) {
    return (
      <button className={classNames(buttonClassName, className)} disabled={true}>
        Withdraw
      </button>
    )
  }

  return (
    <button
      type='submit'
      onClick={sendWithdrawTransaction}
      disabled={!sendWithdrawTransaction || disabled}
      className={classNames(buttonClassName, className)}
    >
      Withdraw
    </button>
  )
}
