'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { vaultsProps } from '@/utils/props'
import { config } from '@/utils/config'
import {  getPublicClient } from '@wagmi/core'
import { useRouter } from 'next/navigation'
import { ArrowRight, TrendingUp, Star, StarOff} from 'lucide-react'
import { Button } from '../ui/button'
import { useFavorites } from '@/utils/favorites'
import { useAccount } from 'wagmi'
import { toast } from '../ui/use-toast'

export default function CardExplorer({ vault }: { vault: vaultsProps }) {
  const [priceHodl, setPriceHodl] = useState<number | null>(null)
  const [totalValueLocked, setTotalValueLocked] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const chainId = vault.chainId
  const router = useRouter()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { address: userAddress } = useAccount()

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

  const checkFavoriteStatus = useCallback(async () => {
    if (!userAddress) {
      setIsFavorited(false)
      return
    }

    try {
      const favoriteStatus = await isFavorite(vault.vaultAddress, vault.chainId, userAddress)
      setIsFavorited(favoriteStatus)
    } catch (error) {
      console.error('Error checking favorite status:', error)
      setIsFavorited(false)
    }
  }, [vault.vaultAddress, vault.chainId, userAddress, isFavorite])

  useEffect(() => {
    getReservesPrices()
    checkFavoriteStatus()
  }, [getReservesPrices, checkFavoriteStatus])

  const handleContinue = () => {
    if (vault.vaultAddress) {
      router.push(`/v?chainId=${chainId}&vault=${vault.vaultAddress}`)
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    
    if (!userAddress) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to add favorites',
        variant: 'destructive',
      })
      return
    }

    try {
      setFavoriteLoading(true)
      const newState = await toggleFavorite(vault, userAddress)
      setIsFavorited(newState)
      
      toast({
        title: newState ? 'Added to Favorites' : 'Removed from Favorites',
        description: newState 
          ? `${vault.coinName} has been added to your favorites`
          : `${vault.coinName} has been removed from your favorites`,
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast({
        title: 'Error',
        description: 'Failed to update favorite status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setFavoriteLoading(false)
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
    <Card className='group relative overflow-hidden bg-background border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:scale-[1.02] rounded-2xl cursor-pointer'>
      {/* Hover gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-purple-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl' />
      
      <CardHeader className='pb-4 relative z-10'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className='min-w-0 flex-1'>
                                <h3 className='font-bold text-xl truncate transform transition-all duration-300 group-hover:scale-105 text-gradient' title={`${vault.coinName} Vault`}>
                <span className='text-3d'>{vault.coinName}</span>
              </h3>
              <p className='text-sm text-muted-foreground font-medium mt-1 transition-colors duration-300 group-hover:text-muted-foreground/80'>
                {vault.coinSymbol} Vault
              </p>
            </div>
          </div>
          
          <div className='flex items-center gap-2'>
            {/* Star Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:scale-110 transition-all duration-200 disabled:opacity-50"
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              {favoriteLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              ) : isFavorited ? (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              ) : (
                <StarOff className="h-4 w-4 text-muted-foreground hover:text-yellow-500" />
              )}
            </Button>
            
            {/* Enhanced Chain Badge with 3D effect */}
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium border transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:-translate-y-0.5 ${getChainColor(chainId)}`}>
              <span className='text-3d'>{getChainName(chainId)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className='space-y-5 pt-0 relative z-10'>
        {/* Enhanced Price Display with 3D effect */}
        <div className='p-4 rounded-xl bg-muted/30 border border-border/40 relative overflow-hidden group-hover:bg-muted/50 group-hover:border-border/60 transition-all duration-300 group-hover:shadow-md'>
          <div className='absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl' />
          <div className='flex items-center justify-between relative z-10'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-green-400 dark:text-green-500/80 transition-transform duration-300 group-hover:scale-110' />
              <span className='text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-green-600 dark:group-hover:text-green-400'>
                Hodl Price
              </span>
            </div>
            <div className='text-right'>
              {loading ? (
                <div className='h-5 w-20 bg-muted animate-pulse rounded' />
              ) : (
                <span className='font-mono font-bold text-lg text-foreground/90 dark:text-foreground/80 transition-colors duration-300 group-hover:text-green-600 dark:group-hover:text-green-400'>
                  {priceHodl !== null ? `${(Number(priceHodl) / 100000).toFixed(5)}` : 'N/A'} {vault.coinSymbol}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Total Value Locked */}
        <div className='p-4 rounded-xl bg-muted/30 border border-border/40 relative overflow-hidden group-hover:bg-muted/50 group-hover:border-border/60 transition-all duration-300 group-hover:shadow-md'>
          <div className='absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl' />
          <div className='flex items-center justify-between relative z-10'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-blue-400 dark:text-blue-500/80 transition-transform duration-300 group-hover:scale-110' />
              <span className='text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'>
                TVL
              </span>
            </div>
            <div className='text-right'>
              {loading ? (
                <div className='h-5 w-20 bg-muted animate-pulse rounded' />
              ) : (
                <span className='font-mono font-bold text-lg text-foreground/90 dark:text-foreground/80 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'>
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
          className='relative z-10 w-full mt-4 h-11 bg-gradient-to-r from-primary/70 to-purple-500/70 hover:from-primary/90 hover:to-purple-500/90 dark:from-primary/60 dark:to-purple-500/60 dark:hover:from-primary/80 dark:hover:to-purple-500/80 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 text-base font-medium button-3d overflow-hidden rounded-xl'
        >
          <div className='absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl' />
          <span className='text-3d relative z-10'>Enter Vault</span>
          <ArrowRight className='h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform duration-300 relative z-10' />
        </Button>
      </CardContent>
    </Card>
  )
}
