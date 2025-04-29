'use client'

import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector'
import { WagmiProvider as WagmiProviderBase } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const config = createConfig({
    chains: [base],
    transports: {
        [base.id]: http(),
    },
    connectors: [
        miniAppConnector()
    ]
})

const queryClient = new QueryClient()

export function WagmiProvider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProviderBase config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProviderBase>
    )
} 