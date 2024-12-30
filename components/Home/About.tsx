'use client'

import Link from 'next/link'
import './gradient.css'
import Image from 'next/image'

export function About() {
  return (
    <div className='w-[100vw]'>
      <div className='w-full relative py-24'>
        <div className='flex flex-col items-center justify-center h-full space-y-6'>
          <div className='w-full max-w-screen-lg flex flex-row'>
            <div className='p-2'>
              <div className='flex flex-col items-center justify-center p-2 rounded-lg shadow-xl transition-transform transform hover:scale-105'>
                <Link
                  href='https://eprint.iacr.org/2023/1029'
                  target='_blank'
                  className='cursor-pointer'
                >
                  <Image
                    unoptimized
                    fetchPriority='high'
                    loading='lazy'
                    src='./images/paper.png'
                    alt='Stability Nexus Logo'
                    width={350}
                    height={350}
                    className='cursor-pointer hidden rounded-lg lg:inline-block'
                  />
                </Link>
              </div>
            </div>
            <div className='flex-1 p-16 flex flex-col space-y-6 items-center justify-start'>
              <h1 className='text-3xl font-bold text-center text-primary'>
                About HodlCoin
              </h1>
              <p className='text-md'>
                hodlCoin is a staking protocol that encourages staking (&quot;hodling&quot;)
                assets for long periods of time. When hodling, users deposit coins of
                a given asset in a vault and receive a proportional amount of corresponding hodlCoins. 
                When unhodling, users must pay an unstaking fee that benefits the vault's creator and users
                who continue hodling longer. Moreover, anyone (especially vault creators) can 
                distribute rewards to hodlers, to further incentivize hodling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
