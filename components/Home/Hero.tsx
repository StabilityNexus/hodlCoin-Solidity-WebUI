'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '../ui/button'
import LogoAnimated from '/logo-animated.gif'

export function Hero() {
  return (
    <div className='w-[100vw]'>
      <div className='w-full h-[90vh] bg-blue-200'>
        <div className='flex flex-col items-center justify-center h-full space-y-6'>
          <Image
            priority
            fetchPriority='high'
            src={'./logo-animated.gif'}
            alt='my gif'
            height={65}
            width={65}
            unoptimized={true}
          />
          <h1 className='text-5xl font-bold text-center text-black'>
            HodlCoin
          </h1>
          <p className='text-lg text-center text-black'>
            The first decentralized cryptocurrency
          </p>
          <Link href='/createVault'>
            <Button>Create Vault</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
