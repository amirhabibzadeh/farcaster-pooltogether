import { NETWORK, PRIZE_POOLS, VaultList } from '@generationsoftware/hyperstructure-client-js'
import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { farcasterFrame } from '@farcaster/frame-wagmi-connector'

// List of public RPCs for Base network
const BASE_RPCS = [
  'https://mainnet.base.org',
  'https://base.blockpi.network/v1/rpc/public',
  'https://base.meowrpc.com',
  'https://1rpc.io/base',
  'https://base.publicnode.com'
]

export const PRIZE_POOL_INFO = PRIZE_POOLS.find(
  (entry) => entry.chainId === NETWORK.base
) as NonNullable<(typeof PRIZE_POOLS)[number]>

export const VAULT_LIST: VaultList = {
  name: 'PoolTogether V5',
  version: { major: 1, minor: 0, patch: 0 },
  timestamp: '2024-02-20T00:00:00.000Z',
  tokens: [
    {
      chainId: NETWORK.base,
      address: '0x7f5C2b379b88499aC2B997Db583f8079503f25b9',
      name: 'USDC Prize Vault',
      decimals: 6,
      symbol: 'USDC',
      logoURI: 'https://etherscan.io/token/images/centre-usdc_28.png'
    },
    {
      chainId: NETWORK.base,
      address: '0x4e42f783db2d0c5bdff40fdc66fcae8b1cda4a43',
      name: 'WETH Prize Vault',
      decimals: 18,
      symbol: 'WETH',
      logoURI: 'https://etherscan.io/token/images/weth_28.png'
    }
  ]
}

// Map of vault addresses to their RPC URLs
export const VAULT_RPC_URLS: Record<string, string> = {
  '0x7f5C2b379b88499aC2B997Db583f8079503f25b9': BASE_RPCS[0], // USDC vault
  '0x4e42f783db2d0c5bdff40fdc66fcae8b1cda4a43': BASE_RPCS[1]  // WETH vault
}

/**
 * @dev to edit the wallet list or add a walletconnect project ID, use RainbowKit's `getDefaultConfig` instead of `createConfig`
 */
export const WAGMI_CONFIG = createConfig({
  chains: [base],
  transports: {
    [NETWORK.base]: http(BASE_RPCS[2]) // Third RPC for general use
  },
  connectors: [
    farcasterFrame()
  ]
})
