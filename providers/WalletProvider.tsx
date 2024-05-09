'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { config } from '@/utils/config'
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { useTheme } from 'next-themes'

const queryClient = new QueryClient()

export function WalletProvider({ children }: { children: ReactNode }) {
  // const [currentTheme, setCurrentTheme] = useState<string>('light')

  // const currentTheme =
  //   useTheme().theme === 'dark'
  //     ? darkTheme({
  //         accentColor: 'hsl(var(--primary))',
  //         accentColorForeground: 'white',
  //         borderRadius: 'medium',
  //         overlayBlur: 'small',
  //       })
  //     : lightTheme({
  //         accentColor: 'hsl(var(--primary))',
  //         accentColorForeground: 'white',
  //         borderRadius: 'medium',
  //         overlayBlur: 'small',
  //       })

  // useEffect(() => {
  //   if (useTheme().theme === 'dark') {
  //     setCurrentTheme('dark')
  //   }
  //   if (useTheme().theme === 'light') {
  //     setCurrentTheme('light')
  //   }
  //   console.log(currentTheme)
  // }, [useTheme().theme])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: 'hsl(var(--primary))',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            overlayBlur: 'small',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
