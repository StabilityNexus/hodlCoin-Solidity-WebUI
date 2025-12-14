'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { vaultsProps } from '@/utils/props'
import { useRouter } from 'next/navigation'
import { ArrowRight, TrendingUp, Star, StarOff } from 'lucide-react'
import { Button } from '../ui/button'
import { useFavorites } from '@/utils/favorites'
import { useAccount } from 'wagmi'
import { toast } from '../ui/use-toast'
import { getChainName } from '@/utils/chains'
import { validateVaultRoute } from '@/utils/validation'

// Extended vault props with price and TVL data
interface ExtendedVaultProps extends vaultsProps {
  priceHodl?: number | null
  totalValueLocked?: number | null
  dataLoaded?: boolean
}

export default function CardExplorer({ vault }: { vault: ExtendedVaultProps }) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  const router = useRouter()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { address: userAddress } = useAccount()

  const checkFavoriteStatus = useCallback(async () => {
    if (!userAddress) {
      setIsFavorited(false)
      return
    }

    try {
      const favoriteStatus = await isFavorite(
        vault.vaultAddress,
        vault.chainId,
        userAddress
      )
      setIsFavorited(favoriteStatus)
    } catch (error) {
      console.error('Error checking favorite status:', error)
      setIsFavorited(false)
    }
  }, [vault.vaultAddress, vault.chainId, userAddress, isFavorite])

  useEffect(() => {
    checkFavoriteStatus()
  }, [checkFavoriteStatus])

  // ✅ FIXED: canonical routing + validation
  const handleContinue = () => {
    const validation = validateVaultRoute(
      vault.vaultAddress,
      vault.chainId
    )

    if (!validation.valid) {
      toast({
        title: 'Invalid Vault',
        description: validation.error ?? 'Invalid vault or chain',
        variant: 'destructive',
      })
      return
    }

    router.push(`/${vault.vaultAddress}?chainId=${vault.chainId}`)
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()

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

  const getChainColor = (chainId: number) => {
    const chainColors: { [key: number]: string } = {
      1: 'bg-purple-400/10 text-purple-500 border-purple-400/20',
      137: 'bg-violet-400/10 text-violet-500 border-violet-400/20',
      534351: 'bg-amber-400/10 text-amber-500 border-amber-400/20',
    }
    return (
      chainColors[chainId] ||
      'bg-gray-400/10 text-gray-500 border-gray-400/20'
    )
  }

  return (
    <Card className="group relative overflow-hidden cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-xl">{vault.coinName}</h3>
            <p className="text-sm text-muted-foreground">
              {vault.coinSymbol} Vault
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
          >
            {isFavorited ? <Star /> : <StarOff />}
          </Button>
        </div>

        <div
          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs border ${getChainColor(
            vault.chainId
          )}`}
        >
          {getChainName(vault.chainId)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <span className="text-sm text-muted-foreground">Hodl Price</span>
          <div className="font-mono font-bold">
            {vault.priceHodl
              ? (Number(vault.priceHodl) / 100000).toFixed(5)
              : 'N/A'}{' '}
            {vault.coinSymbol}
          </div>
        </div>

        <div>
          <span className="text-sm text-muted-foreground">TVL</span>
          <div className="font-mono font-bold">
            {vault.totalValueLocked?.toFixed(2) ?? '0.00'}{' '}
            {vault.coinSymbol}
          </div>
        </div>

        <Button
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2"
        >
          Enter Vault
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
