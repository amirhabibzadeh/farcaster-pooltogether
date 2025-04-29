import { Vault } from '@generationsoftware/hyperstructure-client-js'
import { useUserVaultTokenBalance } from '@generationsoftware/hyperstructure-react-hooks'
import classNames from 'classnames'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { Loading } from '@components/Loading'
import { formatTokenAmount } from '@utils/formatting'
import { useEffect } from 'react'

interface VaultUserBalanceProps {
  vault: Vault
  className?: string
}

export const VaultUserBalance = (props: VaultUserBalanceProps) => {
  const { vault, className } = props

  const { address: userAddress } = useAccount()

  const { data: token, isFetched: isFetchedUserVaultTokenBalance, refetch: refetchUserVaultBalance } = useUserVaultTokenBalance(
    vault,
    userAddress as Address
  )

  // Refetch balance when component mounts and when user address changes
  useEffect(() => {
    if (userAddress) {
      refetchUserVaultBalance()
    }
  }, [userAddress, refetchUserVaultBalance])

  const userBalance = token?.amount ? formatTokenAmount(token.amount, token.decimals, { maximumFractionDigits: 3 }) : '0'

  return (
    <div className={classNames('flex gap-1 items-center', className)}>
      <span className='text-pt-purple-100'>Your Balance:</span>
      {!userAddress ? (
        <span className='text-pt-purple-300'>Connect wallet to view</span>
      ) : isFetchedUserVaultTokenBalance ? (
        <span>
          {userBalance} {token?.symbol}
        </span>
      ) : (
        <Loading className='h-2' />
      )}
    </div>
  )
}
