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
                The hodlCoin is a financial mechanism where the goal is to hodl
                an asset for long periods of time. By hodling, a user deposits
                coins of a given asset in a common reserve and receives a
                proportional amount of hodlCoins
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
