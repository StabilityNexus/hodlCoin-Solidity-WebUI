'use client'

import { vaultsData } from '@/utils/mock'
import { vaultsProps } from '@/utils/props'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Coins, Info, LockKeyhole, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function VaultInformation({
  vault,
  priceHodl,
  reserve,
  supply,
  vaultFee,
  vaultCreatorFee,
  stableOrderFee,
}: {
  vault: vaultsProps | null
  priceHodl: any
  reserve: any
  supply: any
  vaultFee: number
  vaultCreatorFee: number
  stableOrderFee: number
}) {
  return (
    <main className='container mx-auto p-4 mb-8'>
      <div className='relative'>
        <Card className='bg-[#141414] border-gray-900'>
          <CardHeader>
            <CardTitle className='text-yellow-500 flex items-center gap-2'>
              <Info className='h-5 w-5' />
              Vault Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div>
                  <h2 className='text-sm font-medium text-gray-400 mb-1'>
                    Staked ERC20 Token Address
                  </h2>
                  <div className='bg-black rounded-xl p-3 flex items-center justify-between'>
                    <code className='font-mono text-sm'>{vault?.coinAddress}</code>
                  </div>
                </div>
                <div>
                  <h2 className='text-sm font-medium text-gray-400 mb-1'>
                    Vault Contract Address
                  </h2>
                  <div className='bg-black rounded-xl p-3 flex items-center justify-between'>
                    <code className='font-mono text-sm'>{vault?.vaultAddress}</code>
                  </div>
                </div>
              </div>
              <div className='space-y-4'>
                <div>
                  <h2 className='text-sm font-medium text-gray-400 mb-1'>
                    Vault Fee
                  </h2>
                  <div className='bg-black rounded-xl p-3'>
                    <span className='text-lg font-semibold'>{vaultFee}%</span>
                  </div>
                </div>
                <div>
                  <h2 className='text-sm font-medium text-gray-400 mb-1'>
                    Vault Creator Fee
                  </h2>
                  <div className='bg-black rounded-xl p-3'>
                    <span className='text-lg font-semibold'>{vaultCreatorFee}%</span>
                  </div>
                </div>
                <div>
                  <h2 className='text-sm font-medium text-gray-400 mb-1'>
                    Stable Order Fee
                  </h2>
                  <div className='bg-black rounded-xl p-3'>
                    <span className='text-lg font-semibold'>{stableOrderFee}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
