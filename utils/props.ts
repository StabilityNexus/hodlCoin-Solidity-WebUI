export type vaultsProps = {
  coinAddress: `0x${string}`
  vaultAddress: `0x${string}`
  coinName: string
  coinSymbol: string
  chainId: number
}

export type creatorToVaultProps = {
  chainId: string
  coinName: string
  coinSymbol: string
  coinAddress: `0x${string}`
  vaultAddress: `0x${string}`
  price: number
}
