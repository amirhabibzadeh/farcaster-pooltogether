import { Vault } from '@generationsoftware/hyperstructure-client-js'
import { useUserVaultTokenBalance } from '@generationsoftware/hyperstructure-react-hooks'
import classNames from 'classnames'
import { useForm } from 'react-hook-form'
import { Address, formatUnits, parseUnits } from 'viem'
import { useAccount } from 'wagmi'
import { Loading } from '@components/Loading'
import { formatTokenAmount } from '@utils/formatting'
import { VaultWithdrawButton } from './WithdrawButton'
import { useEffect } from 'react'

interface VaultWithdrawFormProps {
  vault: Vault
  className?: string
}

export const VaultWithdrawForm = (props: VaultWithdrawFormProps) => {
  const { vault, className } = props

  const { address: userAddress } = useAccount()

  const { data: token, isFetched: isFetchedUserVaultTokenBalance } = useUserVaultTokenBalance(
    vault,
    userAddress as Address
  )

  const userBalance = token?.amount

  const { register, formState, setValue, watch, resetField } = useForm<{ tokenAmount: string }>({
    mode: 'onChange',
    defaultValues: { tokenAmount: '' }
  })

  const formTokenAmount = watch('tokenAmount')

  // Trigger state update when form value changes
  useEffect(() => {
    if (formTokenAmount && userAddress && token) {
      const amount = parseUnits(formTokenAmount, token.decimals)
      if (amount > 0n) {
        // Add a small delay to ensure the form value is updated
        setTimeout(() => {
          window.dispatchEvent(new Event('withdrawAmountChanged'))
        }, 0)
      }
    }
  }, [formTokenAmount, userAddress, token])

  if (!token) {
    return <></>
  }

  const withdrawAmount =
    !!formTokenAmount && formState.isValid ? parseUnits(formTokenAmount, token.decimals) : 0n
  const errorMsg = formState.errors['tokenAmount']?.message

  const handleMaxClick = () => {
    if (userBalance === undefined) return
    const maxAmount = formatUnits(userBalance, token.decimals)
    setValue('tokenAmount', maxAmount, { shouldValidate: true })
    // Add a small delay to ensure the form value is updated
    setTimeout(() => {
      window.dispatchEvent(new Event('withdrawAmountChanged'))
    }, 0)
  }

  return (
    <div className={classNames('flex flex-col items-center gap-6 p-6 bg-white/5 rounded-xl', className)}>
      <div className='w-full flex flex-col items-center gap-2'>
        <span className='text-2xl font-semibold text-pt-purple-100 mb-2'>Withdraw {token.symbol}</span>
        <div className='w-full flex flex-col items-center'>
          <div className='relative w-full flex justify-center'>
            <span className='absolute left-8 top-1/2 -translate-y-1/2 text-4xl text-pt-purple-200'>$</span>
            <input
              id='tokenAmount'
              placeholder='0.00'
              {...register('tokenAmount', {
                validate: {
                  isValidNumber: (v) => !Number.isNaN(Number(v)) || 'Enter a valid number',
                  isGreaterThanOrEqualToZero: (v) =>
                    parseFloat(v) >= 0 || 'Enter a valid positive number',
                  isNotTooPrecise: (v) =>
                    v.split('.').length < 2 ||
                    v.split('.')[1].length <= token.decimals ||
                    'Too many decimals',
                  isNotGreaterThanBalance: (v) =>
                    userBalance === undefined ||
                    parseFloat(formatUnits(userBalance, token.decimals)) >= parseFloat(v) ||
                    `Not enough ${token.symbol} in vault`
                }
              })}
              className='w-full text-center pl-12 pr-4 py-4 text-5xl font-bold bg-transparent text-white placeholder-pt-purple-200 border-none outline-none focus:ring-2 focus:ring-pt-teal-dark rounded-xl'
              style={{ fontFamily: 'inherit', letterSpacing: '0.02em' }}
            />
          </div>
          <span className='mt-2 text-base text-pt-purple-300'>
            {userBalance !== undefined ? `${formatTokenAmount(userBalance, token.decimals, { maximumFractionDigits: 3 })} ${token.symbol} available` : <Loading className='h-4' />}
          </span>
        </div>
        <button
          onClick={handleMaxClick}
          className='mt-1 text-sm text-pt-purple-100 hover:text-pt-purple-200 underline'
          type='button'
        >
          Max
        </button>
      </div>
      <VaultWithdrawButton
        vault={vault}
        withdrawAmount={withdrawAmount}
        onSuccess={() => resetField('tokenAmount')}
        className='w-full mt-6 rounded-xl text-2xl py-4 font-bold bg-pt-teal-dark text-pt-purple-900 hover:bg-pt-teal transition-colors'
      />
      <span className='h-4 text-xs text-pt-warning-light text-center w-full'>{errorMsg}</span>
    </div>
  )
}
