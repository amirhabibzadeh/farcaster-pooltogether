import { useAccount, useConnect, useDisconnect } from 'wagmi'
import classNames from 'classnames'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/frame-sdk'
import { Menu } from '@headlessui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface NavbarProps {
  className?: string
}

export const Navbar = (props: NavbarProps) => {
  const { className } = props
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [farcasterProfile, setFarcasterProfile] = useState<any>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [isFarcasterAvailable, setIsFarcasterAvailable] = useState<boolean>(false)

  useEffect(() => {
    const checkFarcasterAvailability = async () => {
      try {
        // Check if we're in a Farcaster client
        const context = await sdk.context
        setIsFarcasterAvailable(!!context)
      } catch (error) {
        console.error('Farcaster client not available:', error)
        setIsFarcasterAvailable(false)
      }
    }

    checkFarcasterAvailability()
  }, [])

  useEffect(() => {
    const loadFarcasterProfile = async () => {
      if (isConnected && address && isFarcasterAvailable) {
        try {
          setProfileError(null)
          // Get the FID from the address using the Hub API
          const fidResponse = await fetch(`https://hub.pinata.cloud/v1/userDataByAddress?address=${address}`)
          const fidData = await fidResponse.json()

          if (fidData && fidData.fid) {
            // Get the user data using the FID
            const userResponse = await fetch(`https://hub.pinata.cloud/v1/userDataByFid?fid=${fidData.fid}`)
            const userData = await userResponse.json()

            if (userData && userData.messages) {
              const profile = userData.messages.reduce((acc: any, msg: any) => {
                if (msg.data.userDataBody.type === 'USER_DATA_TYPE_USERNAME') {
                  acc.username = msg.data.userDataBody.value
                } else if (msg.data.userDataBody.type === 'USER_DATA_TYPE_DISPLAY') {
                  acc.displayName = msg.data.userDataBody.value
                } else if (msg.data.userDataBody.type === 'USER_DATA_TYPE_PFP') {
                  acc.avatar = msg.data.userDataBody.value
                }
                return acc
              }, {})

              if (Object.keys(profile).length > 0) {
                setFarcasterProfile(profile)
              } else {
                setProfileError('No Farcaster profile found')
              }
            } else {
              setProfileError('No Farcaster profile found')
            }
          } else {
            setProfileError('No Farcaster ID found for this address')
          }
        } catch (error) {
          console.error('Error loading Farcaster profile:', error)
          setProfileError('Failed to load Farcaster profile')
        }
      }
    }

    loadFarcasterProfile()
  }, [isConnected, address, isFarcasterAvailable])

  return (
    <nav
      className={classNames(
        'w-full flex justify-center p-4 bg-inherit',
        'border-b-2 border-b-pt-purple-700 shadow-2xl',
        className
      )}
    >
      <div className='w-full max-w-screen-xl flex items-center justify-between'>
        <Image
          src='pooltogetherLogo.svg'
          alt='PoolTogether Logo'
          width={133}
          height={52}
          priority={true}
        />
        {isConnected ? (
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 focus:outline-none px-4 py-2 min-h-[48px]">
              {farcasterProfile ? (
                <div className="flex items-center gap-2">
                  {farcasterProfile.avatar && (
                    <Image
                      src={farcasterProfile.avatar}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-pt-purple-100 hidden sm:inline text-lg">
                    {farcasterProfile.displayName || farcasterProfile.username}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-pt-purple-700 flex items-center justify-center">
                    <span className="text-pt-purple-100 text-base">
                      {address?.slice(0, 2)}...{address?.slice(-2)}
                    </span>
                  </div>
                  <span className="text-pt-purple-100 hidden sm:inline text-lg">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
              )}
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-pt-purple-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <div className={classNames(
                      'px-4 py-3 text-sm',
                      active ? 'bg-pt-purple-700 text-pt-purple-100' : 'text-pt-purple-200'
                    )}>
                      <div className="font-medium mb-1">Wallet Address</div>
                      <div className="text-lg font-mono break-all leading-relaxed bg-pt-purple-900/60 rounded p-2 select-all">
                        {address}
                      </div>
                    </div>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => disconnect()}
                      className={classNames(
                        'w-full text-left px-4 py-2 text-sm',
                        active ? 'bg-pt-purple-700 text-pt-purple-100' : 'text-pt-purple-200'
                      )}
                    >
                      Disconnect
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        ) : isFarcasterAvailable ? (
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="px-4 py-2 bg-pt-teal-dark text-pt-purple-900 rounded-lg hover:bg-pt-teal transition-colors"
          >
            Connect with Farcaster
          </button>
        ) : (
          <ConnectButton />
        )}
      </div>
    </nav>
  )
}
