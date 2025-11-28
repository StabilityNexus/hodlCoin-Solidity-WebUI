'use client'

import { Plus, Vault, TrendingUp, RefreshCw, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { vaultsProps } from '@/utils/props'
import { useEffect, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { getPublicClient } from '@wagmi/core'
import { config } from '@/utils/config'
import { HodlCoinFactoryAbi } from '@/utils/contracts/HodlCoinFactory'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { HodlCoinVaultFactories } from '@/utils/addresses'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pagination } from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import CardExplorer from '@/components/Explorer/CardExplorer'
import { cn } from '@/lib/utils'
import { indexedDBManager } from '@/utils/indexedDB'
import { ChainDropdown } from '@/components/ChainDropdown'
import { getChainName } from '@/utils/chains'

// Define supported chain IDs to match ChainDropdown
type SupportedChainId = 1 | 137 | 534351 | 5115 | 61 | 2001 | 8453 | 56;

// Extended vault props with price and TVL data
interface ExtendedVaultProps extends vaultsProps {
  priceHodl?: number | null;
  totalValueLocked?: number | null;
  dataLoaded?: boolean;
}

const AllVaults = () => {
  const [vaults, setVaults] = useState<ExtendedVaultProps[]>([])
  const [filteredVaults, setFilteredVaults] = useState<ExtendedVaultProps[]>([])
  const [paginatedVaults, setPaginatedVaults] = useState<ExtendedVaultProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChain, setSelectedChain] = useState<SupportedChainId | 'all'>('all')
  const [dataSource, setDataSource] = useState<'cache' | 'blockchain' | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 6
  })
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const pageSize = 6
  const account = useAccount()
  const connectedChainId = useChainId()
  const router = useRouter()

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
    console.log('📊 Fetching price and TVL data for', basicVaults.length, 'user vaults...')
    
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
    console.log('✅ All user vault data loaded successfully')
    
    return extendedVaults
  }

  // Helper functions for chain management
  const getAvailableChains = (): SupportedChainId[] => {
    return Object.keys(HodlCoinVaultFactories).map(Number) as SupportedChainId[]
  }

  const getChainDisplayName = (chainId: SupportedChainId | 'all') => {
    if (chainId === 'all') return 'All Networks'
    return getChainName(chainId)
  }

  const fetchVaultsFromAllChains = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsSyncing(true)
      } else if (!initialLoadComplete) {
        setIsLoading(true)
      }
      setError(null)
      let allVaults: ExtendedVaultProps[] = []

      if (!account.address) {
        setVaults([])
        setDataSource(null)
        setLastUpdated(null)
        setInitialLoadComplete(true)
        return
      }

      // Try to get cached vaults first (only if not force refresh)
      if (!forceRefresh) {
        console.log('🔍 Checking cache for user vaults...')
        setIsLoadingFromCache(true)
        try {
          const cachedVaults = await indexedDBManager.getUserVaults(account.address)
          if (cachedVaults && cachedVaults.length > 0) {
            console.log('✅ Found cached user vaults:', cachedVaults.length)
            // Convert to ExtendedVaultProps format
            const basicVaults = cachedVaults.map(vault => ({
              ...vault,
              priceHodl: null,
              totalValueLocked: null,
              dataLoaded: false
            }))
            allVaults = basicVaults
            setDataSource('cache')
            setLastUpdated(new Date())
            setInitialLoadComplete(true)
            setIsLoading(false)
            setIsSyncing(false)
            setIsLoadingFromCache(false)
            
            // Fetch price and TVL data for cached vaults
            if (allVaults.length > 0) {
              const basicVaultData = allVaults.map(({ priceHodl, totalValueLocked, dataLoaded, ...vault }) => vault)
              const extendedVaults = await fetchAllVaultData(basicVaultData)
              setVaults(extendedVaults)
            }
            return
          }
          console.log('❌ No cached user vaults found or cache expired')
        } catch (cacheError) {
          console.error('💥 Error reading from cache:', cacheError)
          // Continue with blockchain fetch if cache fails
        }
        setIsLoadingFromCache(false)
      }

      // Fetch from blockchain based on selected chain
      console.log('⛓️ Fetching user vaults from blockchain...')
      
      let basicVaults: vaultsProps[] = []
      if (selectedChain === 'all') {
        // Fetch from all chains
        const chainPromises = Object.entries(HodlCoinVaultFactories).map(
          ([chainId, factoryAddress]) =>
            fetchVaultsForChain(chainId, factoryAddress),
        )
        const results = await Promise.all(chainPromises)
        basicVaults = results
          .flat()
          .filter((vault: vaultsProps | null): vault is vaultsProps => vault !== null)
      } else {
        // Fetch from selected chain only
        const factoryAddress = HodlCoinVaultFactories[selectedChain]
        if (factoryAddress) {
          const chainVaults = await fetchVaultsForChain(selectedChain.toString(), factoryAddress)
          basicVaults = chainVaults.filter((vault: vaultsProps | null): vault is vaultsProps => vault !== null)
        }
      }

      // Sort vaults: connected network first, then others
      if (connectedChainId) {
        basicVaults.sort((a, b) => {
          if (a.chainId === connectedChainId && b.chainId !== connectedChainId) return -1
          if (a.chainId !== connectedChainId && b.chainId === connectedChainId) return 1
          return 0
        })
      }

      // Now fetch price and TVL data for all vaults
      if (basicVaults.length > 0) {
        const extendedVaults = await fetchAllVaultData(basicVaults)
        setVaults(extendedVaults)
      } else {
        setVaults([])
      }

      setDataSource('blockchain')
      setLastUpdated(new Date())
      setInitialLoadComplete(true)

      // Save to cache
      try {
        console.log('💾 Saving user vaults to cache:', basicVaults.length)
        await indexedDBManager.saveUserVaults(account.address, basicVaults)
        console.log('✅ User vaults saved to cache successfully')
      } catch (cacheError) {
        console.error('💥 Error saving to cache:', cacheError)
        // Don't throw error, just log it - caching failure shouldn't break the app
      }

    } catch (error) {
      console.error('Error fetching vaults:', error)
      setError('Failed to fetch vaults. Please try again later.')
    } finally {
      setIsLoading(false)
      setIsSyncing(false)
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

      // Get total vault count for the creator
      const totalCreatorVaults = await publicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: HodlCoinFactoryAbi,
        functionName: 'creatorVaultCount',
        args: [account.address as `0x${string}`],
      }) as bigint

      if (Number(totalCreatorVaults) === 0) {
        return []
      }

      // Get all vault addresses using the slice function
      const vaultAddresses = await publicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: HodlCoinFactoryAbi,
        functionName: 'getCreatorVaultsSlice',
        args: [account.address as `0x${string}`, BigInt(0), totalCreatorVaults - BigInt(1)],
      }) as `0x${string}`[]

      if (vaultAddresses.length === 0) {
        return []
      }

      // Get all vault details efficiently and match with creator vault addresses
      try {
        // Get total vault count
        const totalVaults = await publicClient.readContract({
          address: factoryAddress as `0x${string}`,
          abi: HodlCoinFactoryAbi,
          functionName: 'vaultId',
        }) as bigint

        if (Number(totalVaults) === 0) {
          return []
        }

        // Get all vault details at once
        const allVaultDetails = await publicClient.readContract({
          address: factoryAddress as `0x${string}`,
          abi: HodlCoinFactoryAbi,
          functionName: 'getVaultsSlice',
          args: [BigInt(1), totalVaults],
        }) as Array<{
          vaultAddress: string
          coinName: string
          coinAddress: string
          coinSymbol: string
        }>

        // Filter and match creator vault addresses with vault details
        const creatorVaults = vaultAddresses
          .map(creatorVaultAddress => {
            const vaultDetail = allVaultDetails.find(
              detail => detail.vaultAddress.toLowerCase() === creatorVaultAddress.toLowerCase()
            )
            
            if (vaultDetail) {
              return {
                chainId: parseInt(chainId),
                coinName: vaultDetail.coinName,
                coinAddress: vaultDetail.coinAddress as `0x${string}`,
                coinSymbol: vaultDetail.coinSymbol,
                vaultAddress: creatorVaultAddress,
                decimals: 18, // Standard ERC20 decimals
              }
            }
            return null
          })
          .filter(vault => vault !== null)

        return creatorVaults as vaultsProps[]
      } catch (error) {
        console.error(`Error fetching vault details for chain ${chainId}:`, error)
        return []
      }
    } catch (error) {
      console.error(`Error fetching vaults for chain ${chainId}:`, error)
      return []
    }
  }

  // Handle chain selection
  const handleChainSelect = (chainId: SupportedChainId | 'all') => {
    setSelectedChain(chainId)
    setCurrentPage(1)
    // Trigger refresh with new chain selection
    fetchVaultsFromAllChains()
  }

  // Handle sync
  const handleSync = async () => {
    await fetchVaultsFromAllChains(true)
  }

  // Handle clear cache
  const handleClearCache = async () => {
    if (!account.address) return
    
    try {
      console.log('🗑️ Clearing user vault cache...')
      await indexedDBManager.saveUserVaults(account.address, [])
      setDataSource(null)
      setLastUpdated(null)
      console.log('✅ User vault cache cleared')
      
      // Refresh data from blockchain
      await fetchVaultsFromAllChains(true)
    } catch (error) {
      console.error('💥 Error clearing cache:', error)
    }
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

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
    const totalPages = Math.ceil(filtered.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginated = filtered.slice(startIndex, endIndex)

    setPaginatedVaults(paginated)
    setPagination({
      page: currentPage,
      totalPages,
      totalItems: filtered.length,
      itemsPerPage: pageSize
    })
  }, [vaults, searchQuery, selectedChain, currentPage, pageSize])

  useEffect(() => {
    if (account.address) {
      fetchVaultsFromAllChains()
    }
  }, [account.address])

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
                <h1 className='text-2xl font-bold text-gradient'>My Vaults</h1>
                <p className='text-sm text-muted-foreground'>Manage and monitor your staking vaults</p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className='hidden md:flex items-center gap-3 text-sm'>
              <Link href="/createVault">
                <Button className='h-9 px-3 gap-2 bg-gradient-to-r from-primary/70 to-purple-500/70 hover:from-primary/80 hover:to-purple-500/80 button-3d'>
                  <Plus className='h-4 w-4' />
                  <span className='text-3d'>Create Vault</span>
                </Button>
              </Link>
              <Button
                onClick={handleSync}
                disabled={isLoading || isSyncing || isLoadingFromCache}
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

      {/* Wallet Connection Required */}
      {!account.address ? (
        <div className='container mx-auto px-4 py-20'>
          <div className="text-center space-y-4">
            <div className='w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center'>
              <Vault className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className='space-y-2'>
              <h3 className='text-lg font-medium text-gradient'>Connect Your Wallet</h3>
              <p className='text-muted-foreground max-w-md mx-auto'>
                Please connect your wallet to view and manage your vaults
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
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

              {/* Right Side - Network Dropdown and Clear Filters */}
              <div className='flex items-center gap-3'>
                <ChainDropdown
                  selectedChainId={selectedChain}
                  onChainSelect={handleChainSelect}
                  currentChainId={connectedChainId}
                  availableChains={getAvailableChains()}
                />
                
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
              {isLoading && !initialLoadComplete && !isLoadingFromCache && (
                <Loading variant="vault" message="Loading your vaults from blockchain..." />
              )}

              {/* Cache Loading State */}
              {isLoadingFromCache && (
                <div className='flex justify-center py-8'>
                  <Loading variant="vault" message="Loading cached vaults..." />
                </div>
              )}

              {/* Syncing State */}
              {isSyncing && (
                <div className='flex justify-center py-8'>
                  <Loading variant="sync" message="Syncing with blockchain..." />
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className='text-center py-16'>
                  <div className='space-y-4'>
                    <div className='w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center'>
                      <Vault className='h-8 w-8 text-destructive' />
                    </div>
                    <div className='space-y-2'>
                      <h3 className='text-lg font-medium text-gradient'>Error Loading Vaults</h3>
                      <p className='text-muted-foreground max-w-md mx-auto'>{error}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => fetchVaultsFromAllChains()}
                      className='mt-4'
                    >
                      Try Again
                    </Button>
                  </div>
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
                        {searchQuery || selectedChain !== 'all'
                          ? `No vaults match your current filters. Try adjusting your search terms or network selection.`
                          : 'You have not created any vaults yet. Start by creating your first vault to begin staking!'
                        }
                      </p>
                    </div>
                    {(searchQuery || selectedChain !== 'all') ? (
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
                    ) : (
                      <Link href="/createVault">
                        <Button className='mt-4 bg-gradient-to-r from-primary/70 to-purple-500/70 hover:from-primary/80 hover:to-purple-500/80 button-3d'>
                          Create Your First Vault
                          <Plus className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AllVaults