import { useAccount as useWagmiAccount } from 'wagmi'

export const useAccount = () => {
    const { address, isConnected, isConnecting, isDisconnected } = useWagmiAccount()

    return {
        address,
        isConnected,
        isConnecting,
        isDisconnected,
        isLoggedIn: isConnected,
        isLoggedOut: isDisconnected,
        isLoading: isConnecting
    }
} 