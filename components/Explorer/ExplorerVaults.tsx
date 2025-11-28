'use client'

import { useEffect, useState } from 'react'
import { vaultsProps } from '@/utils/props'
import CardExplorer from './CardExplorer'
import { getPublicClient } from '@wagmi/core'
import { config } from '@/utils/config'
import { HodlCoinVaultFactories } from '@/utils/addresses'
import { HodlCoinFactoryAbi } from '@/utils/contracts/HodlCoinFactory'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { Input } from '../ui/input'
import { Search, Vault, TrendingUp, RefreshCw, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { useAccount, useChainId } from 'wagmi'
import { ChainDropdown } from '../ChainDropdown'
import { indexedDBManager, paginateArray, PaginationData } from '@/utils/indexedDB'
import { Pagination } from '../ui/pagination'
import { Loading } from '../ui/loading'
import { cn } from '@/lib/utils'
import { getChainName } from '@/utils/chains'

// Define supported chain IDs to match ChainDropdown
type SupportedChainId = 1 | 137 | 534351 | 5115 | 61 | 2001 | 8453 | 56;

// Extended vault props with price and TVL data
interface ExtendedVaultProps extends vaultsProps {
  priceHodl?: number | null;
  totalValueLocked?: number | null;
  dataLoaded?: boolean;
}

const ITEMS_PER_PAGE = 6

export default function ExplorerVaults() {
  const [loading, setLoading] = useState(true) // Start with true to prevent flickering
  const [vaults, setVaults] = useState<ExtendedVaultProps[]>([])
  const [filteredVaults, setFilteredVaults] = useState<ExtendedVaultProps[]>([])
  const [paginatedVaults, setPaginatedVaults] = useState<ExtendedVaultProps[]>([])
  const [selectedChain, setSelectedChain] = useState<SupportedChainId | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: ITEMS_PER_PAGE
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [paginationStateLoaded, setPaginationStateLoaded] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [dataSource, setDataSource] = useState<'cache' | 'blockchain' | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
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
        hodlCoinSymbol: vault[4],
        chainId: chainId,
        decimals: 18,
        priceHodl: null,
        totalValueLocked: null,
        dataLoaded: false
      }))
    } catch (error) {
      console.error(`Error fetching vaults for chain ${chainId}:`, error)
      return []
    }
  }

  const fetchVaultPriceAndTVL = async (vault: vaultsProps): Promise<{ priceHodl: number | null; totalValueLocked: number | null }> => {
    try {
      const publicClient = getPublicClient(config as any, { chainId: vault.chainId })
      
      // Get price
      const price = await publicClient?.readContract({
        address: vault.vaultAddress as `0x${string}`,
        abi: HodlCoinAbi,
        functionName: 'priceHodl',
      })

      // Get total supply for TVL calculation
      const totalSupply = await publicClient?.readContract({
        address: vault.vaultAddress as `0x${string}`,
        abi: HodlCoinAbi,
        functionName: 'totalSupply',
      })
      
      // Calculate TVL: totalSupply * priceHodl
      let tvl = null
      if (totalSupply && price) {
        tvl = (Number(totalSupply) / Math.pow(10, vault.decimals)) * (Number(price) / 100000)
      }

      return {
        priceHodl: price ? Number(price) : null,
        totalValueLocked: tvl
      }
    } catch (error) {
      console.error(`Error getting price/TVL for vault ${vault.vaultAddress}:`, error)
      return { priceHodl: null, totalValueLocked: null }
    }
  }

  const fetchAllVaultData = async (basicVaults: vaultsProps[]): Promise<ExtendedVaultProps[]> => {
    console.log('📊 Fetching price and TVL data for', basicVaults.length, 'vaults...')
    
    // Create promises for all vault price/TVL fetches
    const dataPromises = basicVaults.map(async (vault) => {
      const { priceHodl, totalValueLocked } = await fetchVaultPriceAndTVL(vault)
      return {
        ...vault,
        priceHodl,
        totalValueLocked,
        dataLoaded: true
      }
    })

    // Wait for all data to be fetched
    const extendedVaults = await Promise.all(dataPromises)
    console.log('✅ All vault data loaded successfully')
    
    return extendedVaults
  }

  const getVaultsFromCache = async (chainId: string | number): Promise<ExtendedVaultProps[] | null> => {
    try {
      console.log('🔍 Checking cache for chain:', chainId)
      const cached = await indexedDBManager.getExplorerVaults(chainId)
      if (cached && cached.length > 0) {
        console.log('✅ Found cached vaults for chain', chainId, ':', cached.length)
        // Convert to ExtendedVaultProps format
        return cached.map(vault => ({
          ...vault,
          priceHodl: null,
          totalValueLocked: null,
          dataLoaded: false
        }))
      }
      console.log('❌ No cached vaults found for chain:', chainId)
      return null
    } catch (error) {
      console.error('💥 Error getting vaults from cache for chain', chainId, ':', error)
      return null
    }
  }

  const saveVaultsToCache = async (chainId: string | number, vaults: ExtendedVaultProps[]) => {
    try {
      console.log('💾 Saving vaults to cache for chain', chainId, ':', vaults.length)
      // Convert back to basic vaultsProps format for caching
      const basicVaults = vaults.map(({ priceHodl, totalValueLocked, dataLoaded, ...vault }) => vault)
      await indexedDBManager.saveExplorerVaults(chainId, basicVaults)
      console.log('✅ Vaults saved to cache successfully for chain:', chainId)
    } catch (error) {
      console.error('💥 Error saving vaults to cache for chain', chainId, ':', error)
      // Don't throw error, just log it - caching failure shouldn't break the app
    }
  }

  const getVaults = async (forceRefresh = false) => {
    try {
      // Only show loading for sync operations after initial load
      if (forceRefresh) {
        setIsSyncing(true)
      } else if (!initialLoadComplete) {
        setLoading(true)
      }
      
      let allVaults: ExtendedVaultProps[] = []
      let usedCache = false

      console.log('🚀 Starting explorer vault fetch process...', { forceRefresh, selectedChain })

      if (selectedChain === 'all') {
        // Fetch vaults from all chains
        const chainIds = Object.keys(HodlCoinVaultFactories).map(Number)
        console.log('🌐 Fetching from all chains:', chainIds)
        
        // Always try cache first unless force refresh
        if (!forceRefresh) {
          console.log('📦 Attempting to load from cache for all chains...')
          const cachePromises = chainIds.map(chainId => getVaultsFromCache(chainId))
          const cachedResults = await Promise.all(cachePromises)
          
          // Check if we have any cached data
          const validCachedResults = cachedResults.filter(result => result !== null && result.length > 0)
          
          if (validCachedResults.length > 0) {
            console.log('🎯 Using cached vaults from', validCachedResults.length, 'chains')
            allVaults = validCachedResults.flat() as ExtendedVaultProps[]
            usedCache = true
            
            // If we have partial cache, still fetch missing chains
            const cachedChains = chainIds.filter((_, index) => cachedResults[index] !== null && cachedResults[index]!.length > 0)
            const missingChains = chainIds.filter(chainId => !cachedChains.includes(chainId))
            
            if (missingChains.length > 0) {
              console.log('⚠️ Fetching missing chains from blockchain:', missingChains)
              const missingPromises = missingChains.map(chainId => fetchVaultsForChain(chainId))
              const missingResults = await Promise.all(missingPromises)
              
              // Save and add missing results
              for (let i = 0; i < missingChains.length; i++) {
                if (missingResults[i] && missingResults[i].length > 0) {
                  await saveVaultsToCache(missingChains[i], missingResults[i])
                  allVaults.push(...missingResults[i])
                }
              }
              
              // Mixed data source - mostly cache with some fresh data
              if (missingChains.length < chainIds.length) {
                usedCache = true // Still consider it cached if majority came from cache
              }
            }
          }
        }
        
        // If no cache or force refresh, fetch all from blockchain
        if (allVaults.length === 0 || forceRefresh) {
          console.log('🌐 Fetching all chains from blockchain...')
          const vaultPromises = chainIds.map(chainId => {
            console.log(`⛓️ Fetching from chain ${chainId}`)
            return fetchVaultsForChain(chainId)
          })
          const results = await Promise.all(vaultPromises)
          allVaults = results.flat()
          usedCache = false
          
          // Save to cache
          for (let i = 0; i < chainIds.length; i++) {
            if (results[i] && results[i].length > 0) {
              await saveVaultsToCache(chainIds[i], results[i])
            }
          }
        }
        
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
        console.log('🔗 Fetching for selected chain:', selectedChain)
        
        // Try cache first unless force refresh
        if (!forceRefresh) {
          console.log('📦 Checking cache for selected chain:', selectedChain)
          const cachedVaults = await getVaultsFromCache(selectedChain)
          if (cachedVaults && cachedVaults.length > 0) {
            console.log('✅ Using cached vaults for chain', selectedChain, ':', cachedVaults.length)
            allVaults = cachedVaults
            usedCache = true
          }
        }
        
        // If no cache or force refresh, fetch from blockchain
        if (allVaults.length === 0 || forceRefresh) {
          console.log('⛓️ Fetching selected chain from blockchain:', selectedChain)
          const basicVaults = await fetchVaultsForChain(selectedChain as number)
          allVaults = basicVaults
          usedCache = false
          
          // Save to cache
          if (allVaults.length > 0) {
            await saveVaultsToCache(selectedChain, allVaults)
          }
        }
      }

      console.log('📊 Basic vault count:', allVaults.length)
      
      // Now fetch price and TVL data for all vaults
      if (allVaults.length > 0) {
        // Convert to basic vaults for price/TVL fetching if needed
        const basicVaults = allVaults.map(({ priceHodl, totalValueLocked, dataLoaded, ...vault }) => vault)
        const extendedVaults = await fetchAllVaultData(basicVaults)
        setVaults(extendedVaults)
      } else {
        setVaults([])
      }
      
      setDataSource(usedCache ? 'cache' : 'blockchain')
      setLastUpdated(new Date())
      setInitialLoadComplete(true)
    } catch (error) {
      console.error('❌ Error in getVaults:', error)
      setDataSource(null)
      setLastUpdated(null)
    } finally {
      setLoading(false)
      setIsSyncing(false)
    }
  }

  const handleSync = async () => {
    await getVaults(true)
  }

  // Handle clear cache
  const handleClearCache = async () => {
    try {
      console.log('🗑️ Clearing explorer vault cache...')
      if (selectedChain === 'all') {
        // Clear cache for all chains
        const chainIds = Object.keys(HodlCoinVaultFactories).map(Number)
        for (const chainId of chainIds) {
          await indexedDBManager.saveExplorerVaults(chainId, [])
        }
      } else {
        // Clear cache for selected chain only
        await indexedDBManager.saveExplorerVaults(selectedChain, [])
      }
      setDataSource(null)
      setLastUpdated(null)
      console.log('✅ Explorer vault cache cleared')
      
      // Refresh data from blockchain
      await getVaults(true)
    } catch (error) {
      console.error('💥 Error clearing cache:', error)
    }
  }

  const loadPaginationState = async () => {
    try {
      const savedState = await indexedDBManager.getPaginationState('explorer')
      if (savedState) {
        setCurrentPage(savedState.page || 1)
        setSearchQuery(savedState.searchQuery || '')
        
        // Parse selectedChain safely
        const chainValue = savedState.selectedChain
        if (chainValue === 'all' || getAvailableChains().includes(Number(chainValue) as SupportedChainId)) {
          setSelectedChain(chainValue === 'all' ? 'all' : Number(chainValue) as SupportedChainId)
        } else {
          setSelectedChain('all')
        }
      }
    } catch (error) {
      console.error('Error loading pagination state:', error)
    }
    setPaginationStateLoaded(true)
  }

  const savePaginationState = async (page: number, search: string, chain: SupportedChainId | 'all') => {
    try {
      await indexedDBManager.savePaginationState('explorer', {
        page,
        searchQuery: search,
        selectedChain: chain.toString()
      })
    } catch (error) {
      console.error('Error saving pagination state:', error)
    }
  }

  const handleChainSelect = (chainId: SupportedChainId | 'all') => {
    setSelectedChain(chainId)
    setCurrentPage(1)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  useEffect(() => {
    if (paginationStateLoaded && selectedChain) {
      getVaults()
    }
  }, [selectedChain, paginationStateLoaded])

  useEffect(() => {
    if (paginationStateLoaded) {
      savePaginationState(currentPage, searchQuery, selectedChain)
    }
  }, [currentPage, searchQuery, selectedChain, paginationStateLoaded])

  // Filter and paginate vaults
  useEffect(() => {
    let filtered = vaults

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(vault =>
        vault.coinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vault.coinSymbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply chain filter
    if (selectedChain !== 'all') {
      filtered = filtered.filter(vault => vault.chainId === selectedChain)
    }

    setFilteredVaults(filtered)

    // Calculate pagination
    const result = paginateArray(filtered, currentPage, ITEMS_PER_PAGE)
    setPaginatedVaults(result.data)
    setPagination(result.pagination)
  }, [vaults, searchQuery, selectedChain, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    loadPaginationState()
  }, [])

  const getAvailableChains = (): SupportedChainId[] => {
    return Object.keys(HodlCoinVaultFactories).map(Number) as SupportedChainId[]
  }

  const getChainDisplayName = (chainId: SupportedChainId | 'all') => {
    if (chainId === 'all') return 'All Networks'
    return getChainName(chainId)
  }

  return (
    <div className='min-h-screen page-3d'>
      {/* Streamlined Header */}
      <div className='border-b border-border/40 header-3d mb-8'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20 floating-3d'>
                <Vault className='h-6 w-6 text-primary' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-gradient'>Vault Explorer</h1>
                <p className='text-sm text-muted-foreground'>Discover staking vaults across networks</p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className='hidden md:flex items-center gap-3 text-sm'>
              <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-primary/10'>
                <TrendingUp className='h-4 w-4 text-green-500' />
                <span className='font-medium'>{pagination.totalItems}</span>
                <span className='text-muted-foreground'>vaults</span>
              </div>
              <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-primary/10'>
                <Vault className='h-4 w-4 text-blue-500' />
                <span className='font-medium'>{getAvailableChains().length}</span>
                <span className='text-muted-foreground'>networks</span>
              </div>
              <Button
                onClick={handleSync}
                disabled={loading || isSyncing}
                variant="outline"
                size="sm"
                className={cn(
                  'h-9 px-3 gap-2 border-primary/20 hover:bg-primary/5 button-3d',
                  isSyncing && 'animate-pulse'
                )}
              >
                <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
                <span className='text-3d'>Sync</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Separate Controls */}
      <div className='container mx-auto px-4 py-4 mb-8'>
        <div className='flex items-center justify-between gap-4'>
          {/* Left Side - Search Bar */}
          <div className='flex-1 max-w-md'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search vaults by name or symbol...'
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className='pl-10 h-10 border-border/60 bg-background/80 backdrop-blur-sm input-3d'
              />
            </div>
          </div>

          {/* Right Side - Network Dropdown */}
          <div className='flex items-center gap-3'>
            <ChainDropdown
              selectedChainId={selectedChain}
              onChainSelect={handleChainSelect}
              currentChainId={connectedChainId}
              availableChains={getAvailableChains()}
            />
            
            {/* Clear Filters */}
            {(searchQuery || selectedChain !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  handleSearch('')
                  setSelectedChain('all')
                }}
                className='h-10 px-3 gap-2 button-3d'
              >
                <X className='h-4 w-4' />
                <span className='text-3d'>Clear</span>
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters and Data Source Display */}
        {(searchQuery || selectedChain !== 'all' || (initialLoadComplete && vaults.length > 0)) && (
          <div className='flex items-center justify-between text-xs mt-3'>
            <div className='flex items-center gap-2'>
              {(searchQuery || selectedChain !== 'all') && (
                <>
                  <span className='text-muted-foreground'>Active filters:</span>
                  {searchQuery && (
                    <div className='flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary'>
                      <Search className='h-3 w-3' />
                      {searchQuery}
                    </div>
                  )}
                  {selectedChain !== 'all' && (
                    <div className='flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 text-blue-600'>
                      <Vault className='h-3 w-3' />
                      {getChainDisplayName(selectedChain)}
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Data Source Indicator */}
            {initialLoadComplete && vaults.length > 0 && dataSource && lastUpdated && (
              <div 
                className='flex items-center gap-1 px-2 py-1 rounded-md bg-muted/30 text-muted-foreground text-xs cursor-help'
                title={`Data ${dataSource === 'cache' ? 'loaded from cache' : 'fetched from blockchain'} at ${lastUpdated.toLocaleTimeString()}`}
              >
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  dataSource === 'cache' ? 'bg-blue-500' : 'bg-green-500'
                )} />
                <span>
                  {dataSource === 'cache' ? 'Cached' : 'Fresh'} • {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className='container mx-auto px-4 pb-6'>
        <div className='space-y-6 mb-16'>
          {/* Loading State - Only show on initial load */}
          {loading && !initialLoadComplete && (
            <Loading variant="vault" message="Loading vaults..." />
          )}

          {/* Syncing State */}
          {isSyncing && (
            <div className='flex justify-center py-8'>
              <Loading variant="sync" message="Syncing with blockchain..." />
            </div>
          )}

          {/* Vaults Grid */}
          {initialLoadComplete && paginatedVaults.length > 0 && (
            <>
              <div className='grid max-w-6xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {paginatedVaults.map((vault) => (
                  <CardExplorer
                    key={`${vault.chainId}-${vault.vaultAddress}`}
                    vault={vault}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              <div className='flex justify-center mt-8'>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}

          {/* Empty State */}
          {initialLoadComplete && filteredVaults.length === 0 && (
            <div className='text-center py-16'>
              <div className='space-y-4'>
                <div className='w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center'>
                  <Vault className='h-8 w-8 text-muted-foreground' />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-lg font-medium text-gradient'>No vaults found</h3>
                  <p className='text-muted-foreground max-w-md mx-auto'>
                    {searchQuery 
                      ? `No vaults match your search ${searchQuery}. Try adjusting your search terms.`
                      : 'No vaults are available for the selected network.'
                    }
                  </p>
                </div>
                {(searchQuery || selectedChain !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('')
                      handleSearch('')
                      setSelectedChain('all')
                    }}
                    className='mt-4'
                  >
                    Clear All Filters
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