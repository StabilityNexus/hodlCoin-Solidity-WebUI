'use client'

import { vaultsData } from '@/utils/mock'
import { vaultsProps } from '@/utils/props'
import { useEffect, useState } from 'react'
import HodlBox from './HodlBox'
import UnholdBox from './UnhodlBox'
import { Coins, LockKeyhole, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" 

export default function ActionsVault({
  vault,
  coinBalance,
  hodlCoinBalance,
  getBalances,
}: {
  vault: vaultsProps | null
  coinBalance: number
  hodlCoinBalance: number
  getBalances: Function
}) {
  return (
    <main className='container mx-auto p-4 space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <HodlBox
          getBalances={getBalances}
          coinBalance={coinBalance}
          id={vault?.vaultAddress}
          vault={vault}
        />
        <UnholdBox
          getBalances={getBalances}
          hodlCoinBalance={hodlCoinBalance}
          id={vault?.vaultAddress}
          vault={vault}
        />
      </div>
    </main>
  )
}
