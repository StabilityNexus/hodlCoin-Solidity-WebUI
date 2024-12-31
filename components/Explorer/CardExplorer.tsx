'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '../ui/card'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { vaultsProps } from '@/utils/props'
import { config } from '@/utils/config'
import { readContract } from '@wagmi/core'
import { useRouter } from 'next/navigation'

export default function CardExplorer({ vault }: { vault: vaultsProps }) {
  const [priceHodl, setPriceHodl] = useState<number | null>(null)
  const chainId = config.state.chainId
  const router = useRouter()

  const getReservesPrices = async () => {
    try {
      const price = (await readContract(config as any, {
        abi: HodlCoinAbi,
        address: vault.vaultAddress as `0x${string}`,
        functionName: 'priceHodl',
        args: [],
      })) as number

      setPriceHodl(price)
    } catch (err) {
      console.error('Error getting reserves and prices:', err)
    }
  }

  useEffect(() => {
    getReservesPrices()
  }, [vault.vaultAddress])

  const handleContinue = () => {
    if (vault.vaultAddress) {
      router.push(`/v?chainId=${chainId}&vault=${vault.vaultAddress}`)
    }
  }

  return (
    <div
      onClick={handleContinue}
      className='cursor-pointer transform transition-all duration-200 hover:scale-105'
    >
      <Card
        className='dark:bg-zinc-900 bg-white 
        dark:border-zinc-800 border-purple-200
        dark:hover:border-yellow-300 hover:border-yellow-500
        transition-all duration-200 h-30
        hover:shadow-lg'
      >
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <h3
            className='text-lg font-semibold truncate max-w-[200px]
              dark:text-purple-50 text-gray-900'
            title={`${vault.coinName} Vault`}
          >
            {vault.coinName} Vault
          </h3>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span
                className='text-sm truncate max-w-[150px]
                  dark:text-purple-400 text-purple-600'
                title={`Price of 1 ${vault.coinSymbol}`}
              >
                Price of 1 {vault.coinSymbol}
              </span>
              <span
                className='font-mono truncate max-w-[100px]
                  dark:text-yellow-400 text-amber-500
                  font-medium'
                title={
                  priceHodl !== null
                    ? `${Number(priceHodl) / 100000}`
                    : 'Loading...'
                }
              >
                {priceHodl !== null
                  ? `${Number(priceHodl) / 100000}`
                  : 'Loading...'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
