'use client'

import { Plus, ArrowRight, Vault, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { creatorToVaultProps } from '@/utils/props'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { getPublicClient } from '@wagmi/core'
import { config } from '@/utils/config'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { HodlCoinFactoryAbi } from '@/utils/contracts/HodlCoinFactory'
import { HodlCoinVaultFactories } from '@/utils/addresses'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

const AllVaults = () => {
  const [vaults, setVaults] = useState<creatorToVaultProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const account = useAccount()
  const router = useRouter()

  const fetchVaultsFromAllChains = async () => {
    try {
      setIsLoading(true)
      setError(null)
      let allVaults: creatorToVaultProps[] = []

      const chainPromises = Object.entries(HodlCoinVaultFactories).map(
        ([chainId, factoryAddress]) =>
          fetchVaultsForChain(chainId, factoryAddress),
      )

      const results = await Promise.all(chainPromises)
      allVaults = results
        .flat()
        .filter((vault): vault is creatorToVaultProps => vault !== null)

      setVaults(allVaults)
    } catch (error) {
      console.error('Error fetching vaults:', error)
      setError('Failed to fetch vaults. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVaultsForChain = async (
    chainId: string,
    factoryAddress: string,
  ) => {
    try {
      const publicClient = getPublicClient(config as any, {
        chainId: parseInt(chainId),
      })

      if (!publicClient) {
        console.error(`No public client available for chain ${chainId}`)
        return []
      }

      // Get vault addresses for the connected account
      const vaultAddresses = (await publicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: HodlCoinFactoryAbi,
        functionName: 'getVaultAddresses',
        args: [account.address],
      })) as `0x${string}`[]

      // Fetch details for each vault in parallel
      const vaultPromises = vaultAddresses.map(async (vaultAddress, index) => {
        try {
          // Get vault ID by checking each vault in the factory until we find a match
          let vaultId = 1
          let found = false

          while (!found) {
            const vaultInfo = (await publicClient.readContract({
              address: factoryAddress as `0x${string}`,
              abi: HodlCoinFactoryAbi,
              functionName: 'vaults',
              args: [vaultId],
            })) as [string, string, string, string] // [vaultAddress, coinName, coinAddress, coinSymbol]

            if (vaultInfo[0].toLowerCase() === vaultAddress.toLowerCase()) {
              found = true
            } else {
              vaultId++
            }
          }

          // Get price from vault contract
          const priceHodl = (await publicClient.readContract({
            abi: HodlCoinAbi,
            address: vaultAddress,
            functionName: 'priceHodl',
          })) as bigint

          // Get vault details from factory
          const vaultInfo = (await publicClient.readContract({
            address: factoryAddress as `0x${string}`,
            abi: HodlCoinFactoryAbi,
            functionName: 'vaults',
            args: [vaultId],
          })) as [string, string, string, string]

          return {
            chainId,
            coinName: vaultInfo[1], // Name from factory
            coinAddress: vaultInfo[2], // Coin address from factory
            coinSymbol: vaultInfo[3], // Symbol from factory
            vaultAddress: vaultAddress,
            price: Number(Number(priceHodl).toFixed(5)) / 100000,
          }
        } catch (error) {
          console.error(
            `Error fetching vault ${vaultAddress} on chain ${chainId}:`,
            error,
          )
          return null
        }
      })

      const results = await Promise.all(vaultPromises)
      return results.filter(vault => vault !== null)
    } catch (error) {
      console.error(`Error fetching vaults for chain ${chainId}:`, error)
      return []
    }
  }

  useEffect(() => {
    if (account.address) {
      fetchVaultsFromAllChains()
    }
  }, [account.address])

  const handleContinue = (chainId: string, vaultAddress: string) => {
    router.push(`/v?chainId=${chainId}&vault=${vaultAddress}`)
  }

  const getChainName = (chainId: string) => {
    const chainNames: { [key: string]: string } = {
      '1': 'Ethereum',
      '534351': 'Scroll Sepolia',
      '5115': 'Citrea Testnet',
      '61': 'Ethereum Classic',
      '2001': 'Milkomeda',
      '137': 'Polygon',
      '8453': 'Base',
    }
    return chainNames[chainId] || `Chain ${chainId}`
  }

  const getChainColor = (chainId: string) => {
    const chainColors: { [key: string]: string } = {
      '1': 'bg-blue-400/10 text-blue-500 border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-400/80 dark:border-blue-500/20',
      '534351': 'bg-orange-400/10 text-orange-500 border-orange-400/20 dark:bg-orange-500/10 dark:text-orange-400/80 dark:border-orange-500/20',
      '5115': 'bg-yellow-400/10 text-yellow-500 border-yellow-400/20 dark:bg-yellow-500/10 dark:text-yellow-400/80 dark:border-yellow-500/20',
      '61': 'bg-green-400/10 text-green-500 border-green-400/20 dark:bg-green-500/10 dark:text-green-400/80 dark:border-green-500/20',
      '2001': 'bg-purple-400/10 text-purple-500 border-purple-400/20 dark:bg-purple-500/10 dark:text-purple-400/80 dark:border-purple-500/20',
      '137': 'bg-violet-400/10 text-violet-500 border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-400/80 dark:border-violet-500/20',
      '8453': 'bg-blue-400/10 text-blue-500 border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-400/80 dark:border-blue-500/20',
    }
    return chainColors[chainId] || 'bg-gray-400/10 text-gray-500 border-gray-400/20 dark:bg-gray-500/10 dark:text-gray-400/80 dark:border-gray-500/20'
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Modern Header */}
      <div className='border-b border-border/40 bg-gradient-to-r from-background via-primary/[0.02] to-background'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20'>
                  <Vault className='h-6 w-6 text-primary' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-foreground/90 dark:text-foreground/80'>My Vaults</h1>
                  <p className='text-muted-foreground'>Manage and monitor your staking vaults</p>
                </div>
              </div>
            </div>
            
            {/* Stats Card */}
            <div className='hidden md:flex gap-4'>
              <Card className='p-4 bg-background/50 backdrop-blur-sm border-primary/10'>
                <div className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4 text-green-400 dark:text-green-500/80' />
                  <div>
                    <div className='text-sm font-medium'>{vaults.length}</div>
                    <div className='text-xs text-muted-foreground'>My Vaults</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-6'>
        {/* Create Vault Button */}
        <div className='flex justify-end mb-8'>
          <Link href="/createVault">
            <Button className='bg-gradient-to-r from-primary/70 to-purple-500/70 hover:from-primary/80 hover:to-purple-500/80 dark:from-primary/60 dark:to-purple-500/60 dark:hover:from-primary/70 dark:hover:to-purple-500/70 transition-all duration-300 font-medium'>
              <Plus className="mr-2 h-4 w-4" />
              Create New Vault
            </Button>
          </Link>
        </div>

        {/* Results Section */}
        <div className='space-y-6'>
          {/* Loading State */}
          {isLoading && (
            <div className='flex items-center justify-center py-16'>
              <div className='text-center space-y-4'>
                <div className='w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto' />
                <p className='text-muted-foreground'>Loading your vaults...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className='text-center py-16'>
              <Card className='max-w-md mx-auto bg-destructive/10 border-destructive/20'>
                <CardContent className='p-6 text-center'>
                  <p className='text-destructive'>{error}</p>
                  <Button 
                    variant="outline" 
                    onClick={fetchVaultsFromAllChains}
                    className='mt-4'
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Vaults Grid */}
          {!isLoading && !error && vaults.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {vaults.map(vault => (
                <Card
                  key={`${vault.chainId}-${vault.vaultAddress}`}
                  className='group relative overflow-hidden bg-background border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer'
                  onClick={() => handleContinue(vault.chainId, vault.vaultAddress)}
                >
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
                      <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getChainColor(vault.chainId)}`}>
                        {getChainName(vault.chainId)}
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
                          <span className='font-mono font-bold text-lg text-foreground/90 dark:text-foreground/80'>
                            {vault.price.toFixed(5)} {vault.coinSymbol}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <Button 
                      type='button' 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleContinue(vault.chainId, vault.vaultAddress)
                      }}
                      className='relative z-10 w-full mt-6 h-11 bg-gradient-to-r from-primary/70 to-purple-500/70 hover:from-primary/80 hover:to-purple-500/80 dark:from-primary/60 dark:to-purple-500/60 dark:hover:from-primary/70 dark:hover:to-purple-500/70 transition-all duration-300 group-hover:shadow-md text-base font-medium'
                    >
                      <span>Manage Vault</span>
                      <ArrowRight className='h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300' />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && vaults.length === 0 && (
            <div className='text-center py-16'>
              <div className='space-y-4'>
                <div className='w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center'>
                  <Vault className='h-8 w-8 text-muted-foreground' />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-lg font-medium'>No vaults found</h3>
                  <p className='text-muted-foreground max-w-md mx-auto'>
                    You have not created any vaults yet. Start by creating your first vault to begin staking!
                  </p>
                </div>
                <Link href="/createVault">
                  <Button className='mt-4 bg-gradient-to-r from-primary/70 to-purple-500/70 hover:from-primary/80 hover:to-purple-500/80 dark:from-primary/60 dark:to-purple-500/60 dark:hover:from-primary/70 dark:hover:to-purple-500/70 transition-all duration-300'>
                    Create Your First Vault
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AllVaults
