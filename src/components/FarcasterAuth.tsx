import { useAccount, useConnect } from 'wagmi'

const FarcasterAuth = () => {
    const { isConnected, address } = useAccount()
    const { connect, connectors } = useConnect()

    const handleConnect = async () => {
        try {
            const farcasterConnector = connectors.find(connector => connector.id === 'farcaster')
            if (!farcasterConnector) {
                console.error('No Farcaster connector available')
                return
            }
            await connect({ connector: farcasterConnector })
        } catch (err) {
            console.error('Connection error:', err)
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            {isConnected ? (
                <div className="text-pt-purple-100">
                    Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={handleConnect}
                        className="px-4 py-2 bg-pt-teal-dark text-pt-purple-900 rounded-lg hover:bg-pt-teal transition-colors"
                    >
                        Connect with Farcaster
                    </button>
                </div>
            )}
        </div>
    )
}

export default FarcasterAuth 