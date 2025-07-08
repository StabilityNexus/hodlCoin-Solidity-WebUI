'use client'

import { Coins, ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import ActionsVault from '@/components/Vault/Actions'
import HeroVault from '@/components/Vault/HeroVault'
import VaultInformation from '@/components/Vault/VaultInformation'
import { ERC20Abi } from '@/utils/contracts/ERC20'
import { vaultsProps } from '@/utils/props'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { readContract, getPublicClient } from '@wagmi/core'
import { config } from '@/utils/config'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useMatrixEffect } from '@/components/hooks/useMatrixEffect'
import Link from 'next/link'
import { indexedDBManager } from '@/utils/indexedDB'
import { toast } from '@/components/ui/use-toast'

export default function InteractionClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const account = useAccount()
  const matrixRef = useMatrixEffect(0.15, 2)

  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [chainId, setChainId] = useState<number>(0)
  const [vaultAddress, setVaultAddress] = useState<`0x${string}`>('0x0')
  const [vaultCreator, setVaultCreator] = useState<`0x${string}`>('0x0')
  const [coinAddress, setCoinAddress] = useState<`0x${string}`>('0x0')
  const [coinName, setCoinName] = useState<string>('')
  const [coinSymbol, setCoinSymbol] = useState<string>('')
  const [hodlCoinSymbol, setHodlCoinSymbol] = useState<string>('')

  const [vault, setVault] = useState<vaultsProps>({
    coinAddress: '0x0' as `0x${string}`,
    coinName: '',
    coinSymbol: '',
    hodlCoinSymbol: '',
    decimals: 0,
    vaultAddress: '0x0' as `0x${string}`,
    chainId: 0,
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

  useEffect(() => {
    const vault = searchParams.get('vault')
    const chain = searchParams.get('chainId')

    if (vault && chain) {
      setVaultAddress(vault as `0x${string}`)
      setChainId(Number(chain))
    }
  }, [searchParams])

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

  const getVaultsData = async (forceRefresh: boolean = false) => {
    if (!vaultAddress || !chainId) {
      setError('Invalid vault address or chain ID')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log('🚀 Loading individual vault details...', { vaultAddress, chainId, forceRefresh })

      // Try to get cached data first only if not forcing refresh
      if (!forceRefresh) {
        const cachedData = await indexedDBManager.getIndividualVaultDetails(vaultAddress, chainId)
        
        if (cachedData) {
          console.log('🎯 Using cached vault details:', cachedData)
          
          const vaultData = {
            coinAddress: cachedData.coinAddress as `0x${string}`,
            coinName: cachedData.coinName as string,
            coinSymbol: cachedData.coinSymbol as string,
            hodlCoinSymbol: cachedData.hodlCoinSymbol as string,
            decimals: cachedData.decimals as number,
            vaultAddress: vaultAddress,
            chainId: chainId,
          }

          setVault(vaultData)
          setVaultCreator(cachedData.vaultCreator as `0x${string}`)
          setCoinAddress(cachedData.coinAddress as `0x${string}`)
          setCoinName(cachedData.coinName as string)
          setCoinSymbol(cachedData.coinSymbol as string)
          setHodlCoinSymbol(cachedData.hodlCoinSymbol as string)
          setIsLoading(false)
          return
        }
      }

      console.log('📦 Fetching fresh data from blockchain...')

      // Get chain-specific public client
      const publicClient = getPublicClient(config as any, { chainId })

      if (!publicClient) {
        throw new Error(`No public client available for chain ${chainId}`)
      }

      // Get coin address and vault creator
      const [newCoinAddress, newVaultCreator] = await Promise.all([
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

      // Get token details
      const [name, symbol, decimals, hodlSymbol] = await Promise.all([
        publicClient.readContract({
          abi: ERC20Abi,
          address: newCoinAddress as `0x${string}`,
          functionName: 'name',
        }),
        publicClient.readContract({
          abi: ERC20Abi,
          address: newCoinAddress as `0x${string}`,
          functionName: 'symbol',
        }),
        publicClient.readContract({
          abi: ERC20Abi,
          address: newCoinAddress as `0x${string}`,
          functionName: 'decimals',
        }),
        publicClient.readContract({
          abi: HodlCoinAbi,
          address: vaultAddress,
          functionName: 'symbol',
        }),
      ])

      console.log('📊 Fetched vault details from blockchain:', { name, symbol, decimals, hodlSymbol })

      const vaultDetails = {
        coinAddress: newCoinAddress,
        coinName: name,
        coinSymbol: symbol,
        hodlCoinSymbol: hodlSymbol,
        decimals: decimals,
        vaultCreator: newVaultCreator,
      }

      // Save to cache
      await indexedDBManager.saveIndividualVaultDetails(vaultAddress, chainId, vaultDetails)
      console.log('💾 Saved vault details to cache')

      const vaultData = {
        coinAddress: newCoinAddress as `0x${string}`,
        coinName: name as string,
        coinSymbol: symbol as string,
        hodlCoinSymbol: hodlSymbol as string,
        decimals: decimals as number,
        vaultAddress: vaultAddress,
        chainId: chainId,
      }

      setVault(vaultData)
      setVaultCreator(newVaultCreator as `0x${string}`)
      setCoinAddress(newCoinAddress as `0x${string}`)
      setCoinName(name as string)
      setCoinSymbol(symbol as string)
      setHodlCoinSymbol(hodlSymbol as string)
    } catch (error) {
      console.error('Error fetching vault data:', error)
      setError('Failed to load vault data. Please check the vault address and chain ID.')
    } finally {
      setIsLoading(false)
    }
  }

  const getFees = async () => {
    if (!vaultAddress || !chainId) return

    try {
      const publicClient = getPublicClient(config as any, { chainId })

      if (!publicClient) return

      const [vaultFeeOnChain, vaultCreatorFeeOnChain, stableOrderFeeOnChain] =
        await Promise.all([
          publicClient.readContract({
            abi: HodlCoinAbi,
            address: vaultAddress,
            functionName: 'vaultFee',
          }),
          publicClient.readContract({
            abi: HodlCoinAbi,
            address: vaultAddress,
            functionName: 'vaultCreatorFee',
          }),
          publicClient.readContract({
            abi: HodlCoinAbi,
            address: vaultAddress,
            functionName: 'stableOrderFee',
          }),
        ])

      setFees({
        vaultFee: Number(vaultFeeOnChain),
        vaultCreatorFee: Number(vaultCreatorFeeOnChain),
        stableOrderFee: Number(stableOrderFeeOnChain),
      })
    } catch (err) {
      console.error('Error getting fees:', err)
    }
  }

  const getBalances = async () => {
    if (!vaultAddress || !coinAddress || !account.address || !chainId) return

    try {
      const publicClient = getPublicClient(config as any, { chainId })

      if (!publicClient) return

      const [coinReserveOnChain, coinBalanceOnChain, hodlCoinBalanceOnChain] =
        await Promise.all([
          publicClient.readContract({
            abi: ERC20Abi,
            address: coinAddress,
            functionName: 'balanceOf',
            args: [vaultAddress],
          }),
          publicClient.readContract({
            abi: ERC20Abi,
            address: coinAddress,
            functionName: 'balanceOf',
            args: [account.address],
          }),
          publicClient.readContract({
            abi: ERC20Abi,
            address: vaultAddress,
            functionName: 'balanceOf',
            args: [account.address],
          }),
        ])

      setBalances(prev => ({
        ...prev,
        coinReserve: Number(coinReserveOnChain) / 10 ** 18,
        coinBalance: Number(coinBalanceOnChain) / 10 ** 18,
        hodlCoinBalance: Number(hodlCoinBalanceOnChain) / 10 ** 18,
      }))
    } catch (err) {
      console.error('Error getting balances:', err)
    }
  }

  const getReservesPrices = async () => {
    if (!vaultAddress || !chainId) return

    try {
      const publicClient = getPublicClient(config as any, { chainId })

      if (!publicClient) return

      const [hodlCoinSupplyOnChain, priceHodlOnChain] = await Promise.all([
        publicClient.readContract({
          abi: ERC20Abi,
          address: vaultAddress,
          functionName: 'totalSupply',
        }),
        publicClient.readContract({
          abi: HodlCoinAbi,
          address: vaultAddress,
          functionName: 'priceHodl',
        }),
      ])

      setBalances(prev => ({
        ...prev,
        hodlCoinSupply: Number(hodlCoinSupplyOnChain) / 10 ** 18,
        priceHodl: Number(priceHodlOnChain) / 100000,
      }))
    } catch (err) {
      console.error('Error getting reserves and prices:', err)
    }
  }

  const handleSync = async () => {
    if (isSyncing) return
    
    try {
      setIsSyncing(true)
      console.log('🔄 Manual sync triggered')
      
      toast({
        title: 'Syncing Data',
        description: 'Refreshing vault data from blockchain...',
      })
      
      // Clear cached data first
      try {
        await indexedDBManager.clearIndividualVaultDetails(vaultAddress, chainId)
        console.log('🗑️ Cleared cached vault data')
      } catch (clearError) {
        console.warn('⚠️ Failed to clear cache, continuing with sync:', clearError)
      }
      
      // Force refresh vault data
      await getVaultsData(true)
      
      // Also refresh balances and other data
      if (vaultAddress && coinAddress && chainId) {
        await Promise.all([
          getReservesPrices(),
          getFees(),
          account.address ? getBalances() : Promise.resolve()
        ])
      }
      
      console.log('✅ Manual sync completed')
      toast({
        title: 'Sync Complete',
        description: 'All vault data has been refreshed successfully.',
      })
    } catch (error) {
      console.error('❌ Manual sync failed:', error)
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync data. Please try again.',
        variant: 'destructive',
      })
      setError('Failed to sync data. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    if (vaultAddress && chainId) {
      getVaultsData()
    }
  }, [vaultAddress, chainId])

  useEffect(() => {
    if (vaultAddress && coinAddress && chainId) {
      getReservesPrices()
      getFees()
    }
    if (vaultAddress && coinAddress && account.address && chainId) {
      getBalances()
    }
  }, [vaultAddress, coinAddress, account.address, chainId])

  if (isLoading) {
    return (
      <div className="relative min-h-screen mt-16 flex items-center justify-center bg-background overflow-hidden">
        {/* Matrix background effect */}
        <div className="absolute inset-0 opacity-10">
          <div ref={matrixRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gray-300/15 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gray-400/10 dark:bg-violet-500/15 rounded-full blur-2xl animate-pulse animation-delay-2000" />
        </div>
        
        <Card className="bg-background/50 backdrop-blur-xl border-primary/20 p-8 shadow-2xl shadow-primary/5">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading vault data...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
        {/* Matrix background effect */}
        <div className="absolute inset-0 opacity-10">
          <div ref={matrixRef} className="absolute inset-0 w-full h-full" />
        </div>
        
        <Card className="bg-background/50 backdrop-blur-xl border-red-500/20 p-8 shadow-2xl shadow-red-500/5 max-w-md mx-4">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
                              <h2 className="text-xl font-semibold text-gradient">Error Loading Vault</h2>
            <p className="text-muted-foreground">{error}</p>
            <Link href="/">
              <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen mt-16 bg-background overflow-hidden">
      {/* Matrix background effect */}
      <div className="absolute inset-0 opacity-10">
        <div ref={matrixRef} className="absolute inset-0 w-full h-full" />
        
        {/* Additional purple glow effects */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gray-300/15 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gray-400/10 dark:bg-violet-500/15 rounded-full blur-2xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-gray-500/5 dark:bg-fuchsia-500/10 rounded-full blur-xl animate-pulse animation-delay-4000" />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-300/5 dark:via-purple-900/5 to-transparent" />
      </div>

      <div className="relative container mx-auto max-w-7xl px-4 py-8 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="hover:bg-primary/10 transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gradient">
              {coinName} Vault
            </h1>
            <p className="text-muted-foreground mt-2">Chain: {getChainName(chainId)}</p>
          </div>
          
          {/* Balance Display and Sync Button - Top Right */}
          <div className="flex gap-3 min-w-[380px] items-center">
            {/* Sync Button */}
            <Button
              onClick={handleSync}
              disabled={isSyncing || isLoading}
              variant="outline"
              size="sm"
              title="Refresh vault data from blockchain and clear cache"
              className="border-primary/50 hover:bg-primary/10 transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync'}
            </Button>
            
            {/* Available Token Balance */}
            <div className="backdrop-blur-xl rounded-xl p-3 shadow-lg 
                          hover:border-purple-400/90 dark:hover:border-purple-500/90 transition-all duration-300 flex-1">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">{coinSymbol} balance</span>
                <span className="font-mono text-sm font-bold text-purple-700 dark:text-purple-300">
                  {parseFloat(balances.coinBalance.toFixed(4))}
                </span>
              </div>
            </div>
            
            {/* Staked HodlCoin Balance */}
            <div className="backdrop-blur-xl rounded-xl p-3 shadow-lg 
                          hover:border-purple-400/90 dark:hover:border-purple-500/90 transition-all duration-300 flex-1">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-amber-500 dark:text-amber-400 font-bold">{hodlCoinSymbol} balance</span>
                <span className="font-mono text-sm font-bold text-amber-500 dark:text-amber-300">
                  {parseFloat(balances.hodlCoinBalance.toFixed(4))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Vault Section */}
        <HeroVault
          vault={vault}
          priceHodl={balances.priceHodl}
          reserve={balances.coinReserve}
          supply={balances.hodlCoinSupply}
        />

        {/* Actions Section */}
        <ActionsVault
          vault={vault}
          priceHodl={balances.priceHodl}
          coinBalance={balances.coinBalance}
          hodlCoinBalance={balances.hodlCoinBalance}
          getBalances={getBalances}
        />

        {/* Vault Information Section */}
        <VaultInformation
          vault={vault}
          vaultFee={fees.vaultFee}
          vaultCreatorFee={fees.vaultCreatorFee}
          stableOrderFee={fees.stableOrderFee}
          vaultCreator={vaultCreator}
        />
      </div>
    </div>
  )
}
