export interface ChainConfig {
  id: number
  name: string
  shortName: string
  explorerUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorers: {
    default: {
      name: string
      url: string
    }
  }
  color: string
}

export const SUPPORTED_CHAINS: { [key: number]: ChainConfig } = {
  1: {
    id: 1,
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://etherscan.io',
      },
    },
    color: 'bg-blue-400/10 text-blue-500 border-blue-400/20',
  },
  61: {
    id: 61,
    name: 'Ethereum Classic',
    shortName: 'Ethereum Classic',
    explorerUrl: 'https://blockscout.com/etc/mainnet',
    nativeCurrency: {
      name: 'Ethereum Classic',
      symbol: 'ETC',
      decimals: 18,
    },
    rpcUrls: ['https://etc.rivet.link'],
    blockExplorers: {
      default: {
        name: 'Blockscout',
        url: 'https://blockscout.com/etc/mainnet',
      },
    },
    color: 'bg-green-400/10 text-green-500 border-green-400/20',
  },
  137: {
    id: 137,
    name: 'Polygon',
    shortName: 'Polygon',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorers: {
      default: {
        name: 'PolygonScan',
        url: 'https://polygonscan.com',
      },
    },
    color: 'bg-violet-400/10 text-violet-500 border-violet-400/20',
  },
  8453: {
    id: 8453,
    name: 'Base',
    shortName: 'Base',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorers: {
      default: {
        name: 'BaseScan',
        url: 'https://basescan.org',
      },
    },
    color: 'bg-blue-400/10 text-blue-500 border-blue-400/20',
  },
  56: {
    id: 56,
    name: 'Binance Smart Chain',
    shortName: 'Binance Smart Chain',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed1.binance.org'],
    blockExplorers: {
      default: {
        name: 'BscScan',
        url: 'https://bscscan.com',
      },
    },
    color: 'bg-yellow-400/10 text-yellow-500 border-yellow-400/20',
  },
  534351: {
    id: 534351,
    name: 'Scroll Sepolia',
    shortName: 'Scroll Sepolia',
    explorerUrl: 'https://sepolia.scrollscan.com',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia-rpc.scroll.io'],
    blockExplorers: {
      default: {
        name: 'Scroll Sepolia Explorer',
        url: 'https://sepolia.scrollscan.com',
      },
    },
    color: 'bg-orange-400/10 text-orange-500 border-orange-400/20',
  },
  5115: {
    id: 5115,
    name: 'Citrea Testnet',
    shortName: 'Citrea Testnet',
    explorerUrl: 'https://explorer.testnet.citrea.xyz',
    nativeCurrency: {
      name: 'Citrea Bitcoin',
      symbol: 'cBTC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.devnet.citrea.xyz'],
    blockExplorers: {
      default: {
        name: 'Citrea Explorer',
        url: 'https://explorer.testnet.citrea.xyz',
      },
    },
    color: 'bg-yellow-300/10 text-yellow-300 border-yellow-300/20',
  },
  2001: {
    id: 2001,
    name: 'Milkomeda',
    shortName: 'Milkomeda',
    explorerUrl: 'https://explorer-mainnet-cardano-evm.c1.milkomeda.com',
    nativeCurrency: {
      name: 'milkADA',
      symbol: 'mADA',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mainnet-cardano-evm.c1.milkomeda.com'],
    blockExplorers: {
      default: {
        name: 'Milkomeda Explorer',
        url: 'https://explorer-mainnet-cardano-evm.c1.milkomeda.com',
      },
    },
    color: 'bg-purple-400/10 text-purple-500 border-purple-400/20',
  },
}

/**
 * Get the display name for a chain
 */
export const getChainName = (chainId: number): string => {
  return SUPPORTED_CHAINS[chainId]?.shortName || `Chain ${chainId}`
}

/**
 * Get the full name for a chain
 */
export const getChainFullName = (chainId: number): string => {
  return SUPPORTED_CHAINS[chainId]?.name || `Chain ${chainId}`
}

/**
 * Get the block explorer URL for a chain
 */
export const getChainExplorer = (chainId: number): string => {
  return SUPPORTED_CHAINS[chainId]?.explorerUrl || ''
}

/**
 * Get the block explorer URL for a specific transaction
 */
export const getTransactionUrl = (chainId: number, txHash: string): string => {
  const explorerUrl = getChainExplorer(chainId)
  return explorerUrl ? `${explorerUrl}/tx/${txHash}` : ''
}

/**
 * Get the block explorer URL for a specific address
 */
export const getAddressUrl = (chainId: number, address: string): string => {
  const explorerUrl = getChainExplorer(chainId)
  return explorerUrl ? `${explorerUrl}/address/${address}` : ''
}

/**
 * Get the block explorer URL for a specific token
 */
export const getTokenUrl = (chainId: number, tokenAddress: string): string => {
  const explorerUrl = getChainExplorer(chainId)
  return explorerUrl ? `${explorerUrl}/token/${tokenAddress}` : ''
}

/**
 * Get the chain color classes for UI styling
 */
export const getChainColor = (chainId: number): string => {
  return SUPPORTED_CHAINS[chainId]?.color || 'bg-gray-400/10 text-gray-500 border-gray-400/20'
}

/**
 * Get the block explorer URL for an address (alias for getAddressUrl for backward compatibility)
 */
export const getBlockExplorerUrl = (chainId: number, address: string): string => {
  return getAddressUrl(chainId, address)
}

/**
 * Get the native currency symbol for a chain
 */
export const getNativeCurrencySymbol = (chainId: number): string => {
  return SUPPORTED_CHAINS[chainId]?.nativeCurrency.symbol || 'ETH'
}

/**
 * Check if a chain is supported
 */
export const isSupportedChain = (chainId: number): boolean => {
  return chainId in SUPPORTED_CHAINS
}

/**
 * Get all supported chain IDs
 */
export const getSupportedChainIds = (): number[] => {
  return Object.keys(SUPPORTED_CHAINS).map(Number)
}

/**
 * Get chain configuration
 */
export const getChainConfig = (chainId: number): ChainConfig | null => {
  return SUPPORTED_CHAINS[chainId] || null
}
