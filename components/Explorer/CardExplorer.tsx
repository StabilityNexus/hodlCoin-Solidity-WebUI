'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { vaultsProps } from '@/utils/props'
import { config } from '@/utils/config'
import {  getPublicClient } from '@wagmi/core'
import { useRouter } from 'next/navigation'
import { ArrowRight, TrendingUp} from 'lucide-react'
import { Button } from '../ui/button'

export default function CardExplorer({ vault }: { vault: vaultsProps }) {
  const [priceHodl, setPriceHodl] = useState<number | null>(null)
  const [totalValueLocked, setTotalValueLocked] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const chainId = vault.chainId
  const router = useRouter()

  const getReservesPrices = useCallback(async () => {
    if (!vault.vaultAddress) return

    try {
      setLoading(true)
      const publicClient = getPublicClient(config as any, { chainId })
      
      // Get price
      const price = await publicClient?.readContract({
        address: vault.vaultAddress as `0x${string}`,
        abi: HodlCoinAbi,
        functionName: 'priceHodl',
      })
      setPriceHodl(Number(price))

      // Get total supply for TVL calculation
      const totalSupply = await publicClient?.readContract({
        address: vault.vaultAddress as `0x${string}`,
        abi: HodlCoinAbi,
        functionName: 'totalSupply',
      })
      
      // Calculate TVL: totalSupply * priceHodl
      if (totalSupply && price) {
        const tvl = (Number(totalSupply) / Math.pow(10, vault.decimals)) * (Number(price) / 100000)
        setTotalValueLocked(tvl)
      }
    } catch (err) {
      console.error(`Error getting price for vault ${vault.vaultAddress}:`, err)
      setPriceHodl(null)
      setTotalValueLocked(null)
    } finally {
      setLoading(false)
    }
  }, [vault.vaultAddress, chainId, vault.decimals])

  useEffect(() => {
    getReservesPrices()
  }, [getReservesPrices])

  const handleContinue = () => {
    if (vault.vaultAddress) {
      router.push(`/v?chainId=${chainId}&vault=${vault.vaultAddress}`)
    }
  }

  const getChainName = (chainId: number) => {
    const chainNames: { [key: number]: string } = {
      1: 'Ethereum',
      534351: 'Scroll Sepolia',
      5115: 'Citrea Testnet',
      61: 'Ethereum Classic',
      2001: 'Milkomeda',
      137: 'Polygon',
      8453: 'Base',
    }
    return chainNames[chainId] || `Chain ${chainId}`
  }

  const getChainColor = (chainId: number) => {
    const chainColors: { [key: number]: string } = {
      1: 'bg-blue-400/10 text-blue-500 border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-400/80 dark:border-blue-500/20',
      534351: 'bg-orange-400/10 text-orange-500 border-orange-400/20 dark:bg-orange-500/10 dark:text-orange-400/80 dark:border-orange-500/20',
      5115: 'bg-yellow-400/10 text-yellow-500 border-yellow-400/20 dark:bg-yellow-500/10 dark:text-yellow-400/80 dark:border-yellow-500/20',
      61: 'bg-green-400/10 text-green-500 border-green-400/20 dark:bg-green-500/10 dark:text-green-400/80 dark:border-green-500/20',
      2001: 'bg-purple-400/10 text-purple-500 border-purple-400/20 dark:bg-purple-500/10 dark:text-purple-400/80 dark:border-purple-500/20',
      137: 'bg-violet-400/10 text-violet-500 border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-400/80 dark:border-violet-500/20',
      8453: 'bg-blue-400/10 text-blue-500 border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-400/80 dark:border-blue-500/20',
    }
    return chainColors[chainId] || 'bg-gray-400/10 text-gray-500 border-gray-400/20 dark:bg-gray-500/10 dark:text-gray-400/80 dark:border-gray-500/20'
  }

  return (
    <Card className='group relative overflow-hidden bg-background border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5'>
      {/* Hover gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-purple-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
      
      <CardHeader className='pb-4'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className='min-w-0 flex-1'>
              <h3 className='font-bold text-xl text-foreground/90 dark:text-foreground/80 truncate' title={`${vault.coinName} Vault`}>
                {vault.coinName}
              </h3>
              <p className='text-sm text-muted-foreground font-medium mt-1'>
                {vault.coinSymbol} Vault
              </p>
            </div>
          </div>
          
          {/* Chain Badge */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getChainColor(chainId)}`}>
            {getChainName(chainId)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className='space-y-5 pt-0'>
        {/* Price Display */}
        <div className='p-4 rounded-lg bg-muted/30 border border-border/40'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-green-400 dark:text-green-500/80' />
              <span className='text-sm font-medium text-muted-foreground'>
                Current Price
              </span>
            </div>
            <div className='text-right'>
              {loading ? (
                <div className='h-5 w-20 bg-muted animate-pulse rounded' />
              ) : (
                <span className='font-mono font-bold text-lg text-foreground/90 dark:text-foreground/80'>
                  {priceHodl !== null ? `${(Number(priceHodl) / 100000).toFixed(5)}` : 'N/A'} {vault.coinSymbol}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Total Value Locked */}
        <div className='p-4 rounded-lg bg-muted/30 border border-border/40'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-blue-400 dark:text-blue-500/80' />
              <span className='text-sm font-medium text-muted-foreground'>
                Total Value Locked
              </span>
            </div>
            <div className='text-right'>
              {loading ? (
                <div className='h-5 w-20 bg-muted animate-pulse rounded' />
              ) : (
                <span className='font-mono font-bold text-lg text-foreground/90 dark:text-foreground/80'>
                  {totalValueLocked !== null ? `${totalValueLocked.toFixed(2)}` : '0.00'} {vault.coinSymbol}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <Button 
          type='button' 
          onClick={handleContinue}
          className='relative z-10 w-full mt-6 h-11 bg-gradient-to-r from-primary/70 to-purple-500/70 hover:from-primary/80 hover:to-purple-500/80 dark:from-primary/60 dark:to-purple-500/60 dark:hover:from-primary/70 dark:hover:to-purple-500/70 transition-all duration-300 group-hover:shadow-md text-base font-medium'
        >
          <span>Enter Vault</span>
          <ArrowRight className='h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300' />
        </Button>
      </CardContent>
    </Card>
  )
}
