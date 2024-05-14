'use client'

import { vaultsData } from '@/utils/mock'
import { vaultsProps } from '@/utils/props'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function HeroVault({ vault }: { vault: vaultsProps | null}) {

  return (
    <div className='w-full flex flex-col items-center justify-center'>
      {vault && (
        <div className='w-full max-w-screen-2xl'>
          <div className='aspect-[10/1] shadow-xl overflow-hidden border-secondary border-[1px]'>
            <div className='w-full h-full flex flex-row justify-between'>
              <div className='h-full aspect-square overflow-hidden'>
                <Image
                  src={vault.avatar}
                  alt=''
                  className='aspect-square h-full'
                  width={200}
                  height={200}
                />
              </div>
              <div className='p-4 flex flex-col items-start justify-center'>
                <h3 className='text-xl font-bold text-foreground'>
                  {vault.name}
                </h3>
                <p className='text-sm text-foreground'>{vault.address}</p>
              </div>
              <div className='py-4 px-16 flex flex-col items-start justify-center'>
                <p className='text-sm text-foreground'>
                  Supply: {vault.supply}
                </p>
                <p className='text-sm text-foreground'>
                  Reserve: {vault.reserve}
                </p>
                {/* <p className='text-sm text-foreground'>Price: {vault.price}</p>
                <p className='text-sm text-foreground'>Rate: {vault.rate}</p> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
