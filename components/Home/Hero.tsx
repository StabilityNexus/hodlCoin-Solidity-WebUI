'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '../ui/button'
import { Player } from '@lottiefiles/react-lottie-player'
import FindVault from '../FindVault/FindVaultForm'

export function Hero() {
  return (
    <div className='w-[100vw]'>
      <div className='w-full h-[90vh]'>
        <div id='DemoGradient' className='absolute'>
          <div className='flex flex-col items-center justify-center h-full space-y-6'>
            <div>
              <Player
                autoplay
                loop
                src='/animations/coin_animation.json'
                style={{ height: '150px', width: '150px' }}
              />
            </div>
            <h1 className='text-5xl font-bold text-center'>HodlCoin</h1>
            <p className='text-lg text-center'>
              The best solution for staking and earning
            </p>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-2 pb-12'>
              <Link href='/createVault'>
                <Button>Create Vault</Button>
              </Link>
              {/* <Link href='/explorer'>
                <Button>Play the game</Button>
              </Link> */}
              <FindVault>Explore the Vaults</FindVault>
            </div>
            <div className='flex flex-row space-x-1 items-center'>
              <p>A project by</p>
              <Link href='https://news.stability.nexus/' target='_blank'>
                <Image
                  unoptimized
                  fetchPriority='high'
                  loading='lazy'
                  src='/logo-animated.gif'
                  alt=''
                  width={40}
                  height={40}
                  className='cursor-pointer mx-1 py-2 hidden lg:inline-block'
                />
              </Link>
              <p>and</p>
              <Link href='https://whalebr.com/' target='_blank'>
                <Image
                  unoptimized
                  fetchPriority='high'
                  loading='lazy'
                  src='/images/whale_logo_green.png'
                  alt=''
                  width={50}
                  height={50}
                  className='cursor-pointer py-2 hidden lg:inline-block'
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
