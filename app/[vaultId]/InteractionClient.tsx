'use client'

import {
  Coins,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import ActionsVault from '@/components/Vault/Actions'
import HeroVault from '@/components/Vault/HeroVault'
import VaultInformation from '@/components/Vault/VaultInformation'
import { ERC20Abi } from '@/utils/contracts/ERC20'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { vaultsProps } from '@/utils/props'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { getPublicClient } from '@wagmi/core'
import { config } from '@/utils/config'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useMatrixEffect } from '@/components/hooks/useMatrixEffect'
import Link from 'next/link'
import { indexedDBManager } from '@/utils/indexedDB'
import { toast } from '@/components/ui/use-toast'
import { getChainName } from '@/utils/chains'

/* -------------------- PROPS -------------------- */
interface InteractionClientProps {
  vaultId: `0x${string}`
  chainId: number
}

export default function InteractionClient({
  vaultId,
  chainId,
}: InteractionClientProps) {
  const account = useAccount()
  const matrixRef = useMatrixEffect(0.15, 2)

  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const vaultAddress = vaultId

  const [vaultCreator, setVaultCreator] = useState<`0x${string}`>('0x0')
  const [coinAddress, setCoinAddress] = useState<`0x${string}`>('0x0')
  const [coinName, setCoinName] = useState('')
  const [coinSymbol, setCoinSymbol] = useState('')
  const [hodlCoinSymbol, setHodlCoinSymbol] = useState('')

  const [vault, setVault] = useState<vaultsProps>({
    coinAddress: '0x0',
    coinName: '',
    coinSymbol: '',
    hodlCoinSymbol: '',
    decimals: 0,
    vaultAddress: vaultAddress,
    chainId,
  })

  const [balances, setBalances] = useState({
    coinBalance: 0,
    hodlCoinBalance: 0,
    coinReserve: 0,
    hodlCoinSupply: 0,
    priceHodl: 0,
  })

  const [fees, setFees] = useState({
    vaultFee: 0,
    vaultCreatorFee: 0,
    stableOrderFee: 0,
  })

  /* -------------------- DATA FETCH -------------------- */

  const getVaultsData = async (forceRefresh = false) => {
    try {
      setIsLoading(true)
      setError(null)

      if (!forceRefresh) {
        const cached = await indexedDBManager.getIndividualVaultDetails(
          vaultAddress,
          chainId
        )
        if (cached) {
          setVault({
            coinAddress: cached.coinAddress,
            coinName: cached.coinName,
            coinSymbol: cached.coinSymbol,
            hodlCoinSymbol: cached.hodlCoinSymbol,
            decimals: cached.decimals,
            vaultAddress,
            chainId,
          })
          setVaultCreator(cached.vaultCreator)
          setCoinAddress(cached.coinAddress)
          setCoinName(cached.coinName)
          setCoinSymbol(cached.coinSymbol)
          setHodlCoinSymbol(cached.hodlCoinSymbol)
          setIsLoading(false)
          return
        }
      }

      const publicClient = getPublicClient(config as any, { chainId })
      if (!publicClient) throw new Error('No public client')

      const [coinAddr, creator] = await Promise.all([
        publicClient.readContract({
          abi: HodlCoinAbi,
          address: vaultAddress,
          functionName: 'coin',
        }),
        publicClient.readContract({
          abi: HodlCoinAbi,
          address: vaultAddress,
          functionName: 'vaultCreator',
        }),
      ])

      const [name, symbol, decimals, hodlSymbol] = await Promise.all([
        publicClient.readContract({
          abi: ERC20Abi,
          address: coinAddr,
          functionName: 'name',
        }),
        publicClient.readContract({
          abi: ERC20Abi,
          address: coinAddr,
          functionName: 'symbol',
        }),
        publicClient.readContract({
          abi: ERC20Abi,
          address: coinAddr,
          functionName: 'decimals',
        }),
        publicClient.readContract({
          abi: HodlCoinAbi,
          address: vaultAddress,
          functionName: 'symbol',
        }),
      ])

      await indexedDBManager.saveIndividualVaultDetails(vaultAddress, chainId, {
        coinAddress: coinAddr,
        coinName: name,
        coinSymbol: symbol,
        hodlCoinSymbol: hodlSymbol,
        decimals,
        vaultCreator: creator,
      })

      setVault({
        coinAddress: coinAddr,
        coinName: name,
        coinSymbol: symbol,
        hodlCoinSymbol: hodlSymbol,
        decimals,
        vaultAddress,
        chainId,
      })
      setVaultCreator(creator)
      setCoinAddress(coinAddr)
      setCoinName(name)
      setCoinSymbol(symbol)
      setHodlCoinSymbol(hodlSymbol)
    } catch (err) {
      console.error(err)
      setError('Failed to load vault data.')
    } finally {
      setIsLoading(false)
    }
  }

  /* -------------------- EFFECTS -------------------- */

  useEffect(() => {
    getVaultsData()
  }, [vaultAddress, chainId])

  /* -------------------- UI -------------------- */

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <AlertCircle className="mx-auto mb-2" />
          <p>{error}</p>
          <Link href="/">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Home
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen mt-16">
      <h1 className="text-center text-3xl font-bold">
        {coinName} Vault — {getChainName(chainId)}
      </h1>

      <HeroVault
        vault={vault}
        priceHodl={balances.priceHodl}
        reserve={balances.coinReserve}
        supply={balances.hodlCoinSupply}
      />

      <ActionsVault
        vault={vault}
        priceHodl={balances.priceHodl}
        coinBalance={balances.coinBalance}
        hodlCoinBalance={balances.hodlCoinBalance}
        getBalances={() => {}}
      />

      <VaultInformation
        vault={vault}
        vaultFee={fees.vaultFee}
        vaultCreatorFee={fees.vaultCreatorFee}
        stableOrderFee={fees.stableOrderFee}
        vaultCreator={vaultCreator}
      />
    </div>
  )
}
