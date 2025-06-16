'use client'

import { vaultsProps } from '@/utils/props'
import HodlBox from './HodlBox'
import UnholdBox from './UnhodlBox'
 
export default function ActionsVault({
  vault,
  priceHodl,
  coinBalance,
  hodlCoinBalance,
  getBalances,
}: {
  vault: vaultsProps | null
  priceHodl: any
  coinBalance: number
  hodlCoinBalance: number
  getBalances: Function
}) {
  return (
    <main className='container mx-auto p-4'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto'>
        <HodlBox
          getBalances={getBalances}
          priceHodl={priceHodl}
          coinBalance={coinBalance}
          vault={vault}
        />
        <UnholdBox
          getBalances={getBalances}
          priceHodl={priceHodl}
          hodlCoinBalance={hodlCoinBalance}
          vault={vault}
        />
      </div>
    </main>
  )
}
