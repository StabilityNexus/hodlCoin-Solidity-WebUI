export interface vaultsProps {
  vaultAddress: `0x${string}`
  coinAddress: `0x${string}`
  coinName: string
  coinSymbol: string
  hodlCoinSymbol?: string
  decimals: number
  chainId: number
}

export interface vaultDetails {
  vaultAddress: `0x${string}`
  coinAddress: `0x${string}`
  coinName: string
  coinSymbol: string
  hodlCoinSymbol?: string
  decimals: number
  vaultCreator: `0x${string}`
}

export type creatorToVaultProps = {
  chainId: string
  coinName: string
  coinSymbol: string
  coinAddress: `0x${string}`
  vaultAddress: `0x${string}`
  price: number
}
