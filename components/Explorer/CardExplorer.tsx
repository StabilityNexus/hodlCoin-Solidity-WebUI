'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { vaultsProps } from '@/utils/props'
import { useRouter } from 'next/navigation'
import { ArrowRight, Star, StarOff } from 'lucide-react'
import { Button } from '../ui/button'
import { useFavorites } from '@/utils/favorites'
import { useAccount } from 'wagmi'
import { toast } from '../ui/use-toast'
import { getChainName, getChainColor } from '@/utils/chains'
import { validateVaultRoute } from '@/utils/validation'

interface ExtendedVaultProps extends vaultsProps {
  priceHodl?: number | null
  totalValueLocked?: number | null
}

/**
 * Explorer card component displaying vault summary and navigation.
 */
export default function CardExplorer({ vault }: { vault: ExtendedVaultProps }) {
  const [isFavorited, setIsFavorited] = useState(false)
  const router = useRouter()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { address } = useAccount()

  const checkFavorite = useCallback(async () => {
    if (!address) return
    setIsFavorited(
      await isFavorite(vault.vaultAddress, vault.chainId, address)
    )
  }, [vault, address, isFavorite])

  useEffect(() => {
    checkFavorite()
  }, [checkFavorite])

  const handleContinue = () => {
    const validation = validateVaultRoute(
      vault.vaultAddress,
      vault.chainId
    )

    if (!validation.valid) {
      toast({ title: 'Invalid vault', variant: 'destructive' })
      return
    }

    router.push(`/${vault.vaultAddress}?chainId=${vault.chainId}`)
  }

  return (
    <Card>
      <CardHeader>
        <h3>{vault.coinName}</h3>
        <span className={getChainColor(vault.chainId)}>
          {getChainName(vault.chainId)}
        </span>
      </CardHeader>

      <CardContent>
        <Button onClick={handleContinue} className="w-full">
          Enter Vault <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
