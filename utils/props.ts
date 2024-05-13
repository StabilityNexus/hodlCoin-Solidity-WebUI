export type vaultsProps = {
  id: number | string
  chainId: number
  name: string
  avatar: string
  address: string
  coinAddress: string
  coinName: string
  supply?: number
  reserve?: number
  hodlPrice?: number
  unhodlPrice?: number
}
