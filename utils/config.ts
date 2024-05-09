import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = getDefaultConfig({
  appName: 'hodlCoin',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? '',
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: true,
})
