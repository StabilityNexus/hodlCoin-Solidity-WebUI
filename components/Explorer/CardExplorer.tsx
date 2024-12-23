import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '../ui/card'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { vaultsProps } from '@/utils/props'
import { config } from '@/utils/config'
import { readContract } from '@wagmi/core'

export default function CardExplorer({ vault }: { vault: vaultsProps }) {
  const [priceHodl, setPriceHodl] = useState<number | null>(null)
  const chainId = config.state.chainId

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

  return (
    <Link href={`/v?chainId=${chainId}&vault=${vault.vaultAddress}`}>
      <Card className='bg-zinc-900 border-zinc-800 hover:border-primary/50 transition-colors h-30'>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <h3
            className='text-lg font-semibold truncate max-w-[200px]'
            title={`${vault.coinName} Vault`}
          >
            {vault.coinName} Vault
          </h3>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span
                className='text-sm text-muted-foreground truncate max-w-[150px]'
                title={`Price of 1 ${vault.coinSymbol}`}
              >
                Price of 1 {vault.coinSymbol}
              </span>
              <span
                className='font-mono text-yellow-500 truncate max-w-[100px]'
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
    </Link>
  )
}