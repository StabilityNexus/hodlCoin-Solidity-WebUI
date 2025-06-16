"use client"

import * as React from "react"
import { WagmiConfig } from "wagmi"
import { config } from "@/utils/config"

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>
} 