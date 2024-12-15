'use client'

import { vaultsData } from '@/utils/mock'
import { vaultsProps } from '@/utils/props'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function HeroVault({
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
    <div className='w-full flex flex-col items-center justify-center'>
      <div className='w-full max-w-screen-2xl'>
        <div className='aspect-[10/1] shadow-xl overflow-hidden border-secondary border-[1px]'>
          <div className='w-full h-full flex flex-row justify-between'>
            <div className='h-full aspect-square overflow-hidden'>
              {/* <Image
                src={vault?.avatar as string}
                alt=''
                className='aspect-square h-full'
                width={200}
                height={200}
              /> */}
            </div>
            <div className='p-4 flex flex-col items-start justify-center'>
              <h3 className='text-xl font-bold text-foreground'>
                {vault?.name}
              </h3>
              <p className='text-sm text-foreground'>{vault?.coinAddress}</p>
            </div>
            <div className='py-4 px-16 flex flex-col items-start justify-center'>
              <p className='text-sm text-foreground'>
                Price Hodl: {priceHodl.toFixed(6)} {vault?.coinName}/{' '}
                {vault?.name}
              </p>
              <p className='text-sm text-foreground'>
                Reserve: {reserve.toFixed(6)} {vault?.coinName}
              </p>
              <p className='text-sm text-foreground'>
                Supply: {supply.toFixed(6)} {vault?.name}
              </p>
              <p className='text-sm text-foreground'>
                Vault Fee: {vaultFee.toFixed(3)}%
              </p>
              <p className='text-sm text-foreground'>
                Vault Creator Fee: {vaultCreatorFee.toFixed(3)}%
              </p>
              <p className='text-sm text-foreground'>
                Stable Order Fee: {stableOrderFee.toFixed(3)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
