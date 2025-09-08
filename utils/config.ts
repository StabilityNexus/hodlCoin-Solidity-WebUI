import {
  base,
  mainnet,
  polygon,
  scrollSepolia
} from 'wagmi/chains'
import {
  getDefaultConfig
} from '@rainbow-me/rainbowkit'
import { citreaTestnet } from '@/components/CitreaTestnet'
import { ethereumClassic } from '@/components/EthereumClassic'

export const config = getDefaultConfig({
  appName: 'hodlcoin',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? '',
  chains: [
    ethereumClassic,
    citreaTestnet,
    polygon,
    base,
    scrollSepolia,
  ],
  ssr: true,
})
