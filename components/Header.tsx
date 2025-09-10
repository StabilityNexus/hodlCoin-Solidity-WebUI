'use client'

import Image from 'next/image'
import React from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { NavBar } from './NavBar'
// import MetamaskContext from '@/contexts/EthersContext'
// import { Button } from './ui/button'
import { ModeToggle } from './toggle-theme'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Header() {
  // const { signer, account, connectWallet } = React.useContext(
  //   MetamaskContext,
  // ) as any

  return (
    <div className='fixed w-full h-16 top-0 z-20 flex flex-col shadow-xl border-b-[1px] border-secondary justify-center backdrop-blur-md bg-background/15'>
      <div className='w-full bg-transparent flex flex-row justify-center items-center lg:px-24 h-14'>
        <Link href='/' className='h-16 flex items-center'>
          {useTheme().theme === 'dark' ? (
            <Image
              className='cursor-pointer h-[100%] w-fit ml-2 py-2 lg:inline-block'
              src="/hodlcoin.svg"
              width={100}
              height={100}
              alt='logo'
            />
          ) : (
            <Image
              className='cursor-pointer h-[100%] w-fit py-2 ml-2 lg:inline-block'
              src="/hodlcoin.svg"
              width={100}
              height={100}
              alt='logo'
            />
          )}
          <p
            className="cursor-pointer font-extrabold text-2xl tracking-tight mr-8 lg:inline-block 
              bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent
              dark:from-purple-400 dark:to-fuchsia-500 dark:bg-gradient-to-r dark:bg-clip-text dark:text-transparent"
            style={{ letterSpacing: '0.01em' }}
          >
            hodlCoin
          </p>
        </Link>
        <div className='flex-1 flex-row h-[100%] px-8 justify-end items-center hidden lg:flex'>
          <NavBar />
        </div>

        <div className='h-[100%] flex flex-row justify-center items-center lg:space-x-12'>
          {/* <AvatarMenu /> */}

          <ModeToggle />

          <ConnectButton />

          {/* <Button onClick={connectWallet}>
            {signer
              ? 'Connected: ' +
                account?.substring(0, 5) +
                '...' +
                account?.substring(38, 42)
              : 'Connect Wallet'}
          </Button> */}
        </div>
      </div>
    </div>
  )
}
