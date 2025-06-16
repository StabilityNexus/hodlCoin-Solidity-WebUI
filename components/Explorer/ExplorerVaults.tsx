'use client'

import { useEffect, useState } from 'react'
import { vaultsProps } from '@/utils/props'
import CardExplorer from './CardExplorer'
import { getPublicClient } from '@wagmi/core'
import { config } from '@/utils/config'
import { HodlCoinVaultFactories } from '@/utils/addresses'
import { HodlCoinFactoryAbi } from '@/utils/contracts/HodlCoinFactory'
import { Input } from '../ui/input'
import { Search, Vault, TrendingUp } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { useAccount, useChainId } from 'wagmi'
import { ChainDropdown } from '../ChainDropdown'

// Define supported chain IDs to match ChainDropdown
type SupportedChainId = 1 | 137 | 534351 | 5115 | 61 | 2001 | 8453;

export default function ExplorerVaults() {
  const [loading, setLoading] = useState(false)
  const [vaults, setVaults] = useState<vaultsProps[]>([])
  const [filteredVaults, setFilteredVaults] = useState<vaultsProps[]>([])
  const [selectedChain, setSelectedChain] = useState<SupportedChainId | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Get connected wallet info
  const { isConnected } = useAccount()
  const connectedChainId = useChainId()

  const fetchVaultsForChain = async (chainId: number) => {
    try {
      const publicClient = getPublicClient(config as any, { chainId })
      const factoryAddress = HodlCoinVaultFactories[chainId]

      if (!factoryAddress) {
        console.error(`No factory address found for chain ${chainId}`)
        return []
      }

      const totalVaults = (await publicClient?.readContract({
        address: factoryAddress,
        abi: HodlCoinFactoryAbi,
        functionName: 'vaultId',
      })) as bigint

      const vaultPromises = []
      for (let i = 1; i <= Number(totalVaults); i++) {
        vaultPromises.push(
          publicClient?.readContract({
            address: factoryAddress,
            abi: HodlCoinFactoryAbi,
            functionName: 'vaults',
            args: [BigInt(i)],
          }),
        )
      }

      const vaultData = await Promise.all(vaultPromises)

      return vaultData.map((vault: any) => ({
        vaultAddress: vault[0],
        coinName: vault[1],
        coinAddress: vault[2],
        coinSymbol: vault[3],
        chainId: chainId,
        decimals: 18
      }))
    } catch (error) {
      console.error(`Error fetching vaults for chain ${chainId}:`, error)
      return []
    }
  }

  const getVaults = async () => {
    try {
      setLoading(true)
      let allVaults: vaultsProps[] = []

      if (selectedChain === 'all') {
        // Fetch vaults from all chains in parallel
        const chainIds = Object.keys(HodlCoinVaultFactories).map(Number)
        const vaultPromises = chainIds.map(chainId =>
          fetchVaultsForChain(chainId),
        )
        const results = await Promise.all(vaultPromises)
        allVaults = results.flat()
        
        // Sort vaults: connected network first, then others
        if (isConnected && connectedChainId) {
          allVaults.sort((a, b) => {
            if (a.chainId === connectedChainId && b.chainId !== connectedChainId) return -1
            if (a.chainId !== connectedChainId && b.chainId === connectedChainId) return 1
            return 0
          })
        }
      } else {
        // Fetch vaults for selected chain only
        allVaults = await fetchVaultsForChain(selectedChain)
      }

      setVaults(allVaults)
      setFilteredVaults(allVaults)
    } catch (err) {
      console.error('Error getting vaults:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getVaults()
  }, [selectedChain, connectedChainId, isConnected])

  const handleChainSelect = (chainId: SupportedChainId | 'all') => {
    setSelectedChain(chainId)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      setFilteredVaults(vaults)
    } else {
      const lowerCaseQuery = query.toLowerCase()
      setFilteredVaults(
        vaults.filter(
          vault =>
            vault.coinName.toLowerCase().includes(lowerCaseQuery) ||
            vault.coinSymbol.toLowerCase().includes(lowerCaseQuery),
        ),
      )
    }
  }

  // Get available chains from HodlCoinVaultFactories
  const getAvailableChains = (): SupportedChainId[] => {
    return Object.keys(HodlCoinVaultFactories).map(Number).filter(chainId => 
      [1, 137, 534351, 5115, 61, 2001, 8453].includes(chainId)
    ) as SupportedChainId[]
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
                  <h1 className='text-3xl font-bold text-gradient'>Vault Explorer</h1>
                  <p className='text-muted-foreground'>Discover HodlCoin staking vaults across networks</p>
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className='hidden md:flex gap-4'>
              <Card className='p-4 bg-background/50 backdrop-blur-sm border-primary/10'>
                <div className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4 text-green-500' />
                  <div>
                    <div className='text-sm font-medium'>{filteredVaults.length}</div>
                    <div className='text-xs text-muted-foreground'>Active Vaults</div>
                  </div>
                </div>
              </Card>
              <Card className='p-4 bg-background/50 backdrop-blur-sm border-primary/10'>
                <div className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4 text-blue-500' />
                  <div>
                    <div className='text-sm font-medium'>{getAvailableChains().length}</div>
                    <div className='text-xs text-muted-foreground'>Networks</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className='container mx-auto px-4 py-6'>
        <div className='flex flex-col sm:flex-row gap-4 mb-8'>
          {/* Search Input */}
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search by token name or symbol...'
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className='pl-10 h-11 bg-background border-border/60 focus:border-primary/60 transition-colors'
            />
          </div>
          
          {/* Chain Filter using ChainDropdown */}
          <ChainDropdown
            selectedChainId={selectedChain}
            onChainSelect={handleChainSelect}
            currentChainId={connectedChainId}
            availableChains={getAvailableChains()}
          />
        </div>

        {/* Results Section */}
        <div className='space-y-6'>
          {/* Loading State */}
          {loading && (
            <div className='flex items-center justify-center py-16'>
              <div className='text-center space-y-4'>
                <div className='w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto' />
                <p className='text-muted-foreground'>Loading vaults...</p>
              </div>
            </div>
          )}

          {/* Vaults Grid */}
          {!loading && filteredVaults.length > 0 && (
            <div className='grid max-w-7xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {filteredVaults.map((vault, index) => (
                <CardExplorer
                  key={`${vault.vaultAddress}-${index}`}
                  vault={vault}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredVaults.length === 0 && (
            <div className='text-center py-16'>
              <div className='space-y-4'>
                <div className='w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center'>
                  <Vault className='h-8 w-8 text-muted-foreground' />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-lg font-medium'>No vaults found</h3>
                  <p className='text-muted-foreground max-w-md mx-auto'>
                    {searchQuery 
                      ? `No vaults match your search "${searchQuery}". Try adjusting your search terms.`
                      : 'No vaults are available for the selected network.'
                    }
                  </p>
                </div>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('')
                      handleSearch('')
                    }}
                    className='mt-4'
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}