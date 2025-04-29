'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { Navbar } from '@components/Navbar'
import { WAGMI_CONFIG } from '@constants/config'
import { FarcasterProvider } from '@providers/FarcasterProvider'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { getRainbowKitTheme } from '@utils/getRainbowKitTheme'
import './globals.css'

const queryClient = new QueryClient()

export default function App({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <WagmiProvider config={WAGMI_CONFIG} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={getRainbowKitTheme()}>
          <FarcasterProvider>
            <div className='min-w-[100vw]'>
              <Navbar className='z-50' />
              <main className='w-full flex flex-col gap-4 items-center px-4 py-8'>{children}</main>
            </div>
          </FarcasterProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
