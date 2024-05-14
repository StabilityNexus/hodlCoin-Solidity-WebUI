'use client'

import { vaultsData } from '@/utils/mock'
import { vaultsProps } from '@/utils/props'
import { useEffect, useState } from 'react'
import HodlBox from './HodlBox'
import UnholdBox from './Unhodl'

export default function ActionsVault({ 
  vault,
  coinBalance,
  hodlCoinBalance,
  getBalances
}: { 
  vault: vaultsProps | null,
  coinBalance: BigInt,
  hodlCoinBalance: BigInt,
  getBalances: Function
}) {

  return (
    <div className='w-full flex flex-col items-center justify-center'>
      {vault && (
        <div className='w-full max-w-screen-2xl py-12 grid grid-cols-1 lg:grid-cols-2 gap-12'>
          <HodlBox getBalances={getBalances} coinBalance={coinBalance} id={vault.address} vault={vault} />
          <UnholdBox  getBalances={getBalances} hodlCoinBalance={hodlCoinBalance}  id={vault.address} vault={vault} />
        </div>
      )}
    </div>
  )
}
