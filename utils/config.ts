import {
  base,
  bsc,
  mainnet,
  polygon,
  scrollSepolia
} from 'wagmi/chains'
import { createWalletLinkConfig } from '@stability-nexus/walletlink'
import { citreaTestnet } from '@/components/CitreaTestnet'
import { ethereumClassic } from '@/components/EthereumClassic'

export const config = createWalletLinkConfig({
  chains: [
    mainnet,
    ethereumClassic,
    citreaTestnet,
    polygon,
    base,
    scrollSepolia,
    bsc,
  ],
  ssr: true,
})
