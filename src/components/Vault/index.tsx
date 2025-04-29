import { VaultInfo } from '@generationsoftware/hyperstructure-client-js'
import { useVault } from '@generationsoftware/hyperstructure-react-hooks'
import classNames from 'classnames'
import { Tab } from '@headlessui/react'
import { VaultBalance } from './Balance'
import { VaultDepositForm } from './DepositForm'
import { VaultHeader } from './Header'
import { VaultUserBalance } from './UserBalance'
import { VaultWithdrawForm } from './WithdrawForm'
import { http } from 'wagmi'

interface VaultProps extends VaultInfo {
  className?: string
  rpcUrl?: string
}

export const Vault = (props: VaultProps) => {
  const { className, rpcUrl, ...rest } = props

  const vault = useVault(rest)

  return (
    <span
      className={classNames('flex flex-col gap-4 px-4 py-6 bg-pt-purple-800 rounded-lg', className)}
    >
      <VaultHeader vault={vault} />
      <hr className='border-pt-purple-600' />
      <VaultUserBalance vault={vault} />
      <VaultBalance vault={vault} />

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-pt-purple-900 p-1">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-pt-purple-400 focus:outline-none',
                selected
                  ? 'bg-pt-purple-700 text-white shadow'
                  : 'text-pt-purple-100 hover:bg-pt-purple-700 hover:text-white'
              )
            }
          >
            Deposit
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-pt-purple-400 focus:outline-none',
                selected
                  ? 'bg-pt-purple-700 text-white shadow'
                  : 'text-pt-purple-100 hover:bg-pt-purple-700 hover:text-white'
              )
            }
          >
            Withdraw
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel>
            <VaultDepositForm vault={vault} />
          </Tab.Panel>
          <Tab.Panel>
            <VaultWithdrawForm vault={vault} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </span>
  )
}
