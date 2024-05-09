import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  scrollSepolia,
  sepolia,

} from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = getDefaultConfig({
  appName: 'hodlCoin',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? '',
  chains: [scrollSepolia],
  ssr: true,
});
