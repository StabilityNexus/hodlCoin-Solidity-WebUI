'use client'

import { Heart, RefreshCw, Search, X, Star, Vault, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChainDropdown } from '@/components/ChainDropdown'
import { Loading } from '@/components/ui/loading'
import { cn } from '@/lib/utils'
import CardExplorer from '@/components/Explorer/CardExplorer'
import { useFavorites } from '@/utils/favorites'
import { vaultsProps } from '@/utils/props'
import { indexedDBManager } from '@/utils/indexedDB'

const ITEMS_PER_PAGE = 6

// Define supported chain IDs to match ChainDropdown
type SupportedChainId = 1 | 137 | 534351 | 5115 | 61 | 2001 | 8453;

const FavoriteVaults = () => {
  const [vaults, setVaults] = useState<vaultsProps[]>([])
  const [filteredVaults, setFilteredVaults] = useState<vaultsProps[]>([])
  const [paginatedVaults, setPaginatedVaults] = useState<vaultsProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSyncing, setIsSyncing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChain, setSelectedChain] = useState<SupportedChainId | 'all'>('all')
  const [paginationStateLoaded, setPaginationStateLoaded] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [dataSource, setDataSource] = useState<'cache' | 'blockchain' | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  const account = useAccount()
  const router = useRouter()
  const connectedChainId = useChainId()
  const { getFavorites } = useFavorites()

  const fetchFavoriteVaultsFromBlockchain = async (forceRefresh = false) => {
    if (!account.address) {
      setVaults([])
      setFilteredVaults([])
      setPaginatedVaults([])
      setDataSource(null)
      setLastUpdated(null)
      setInitialLoadComplete(true)
      setIsLoading(false)
      return
    }

    try {
      if (forceRefresh) {
        setIsSyncing(true)
      } else if (!initialLoadComplete) {
        setIsLoading(true)
      }
      setError(null)
      let favoriteVaults: vaultsProps[] = []
      let usedCache = false

      console.log('🚀 Loading favorite vaults...', { forceRefresh, userAddress: account.address })

      // Try cache first unless force refresh
      if (!forceRefresh) {
        console.log('📦 Attempting to load from cache...')
        const cached = await indexedDBManager.getFavoriteVaults(account.address)
        if (cached && cached.length > 0) {
          console.log('✅ Using cached favorite vaults:', cached.length)
          favoriteVaults = cached
          usedCache = true
          setVaults(favoriteVaults)
          setDataSource('cache')
          setLastUpdated(new Date())
          setInitialLoadComplete(true)
          applyFilters(favoriteVaults, searchQuery, selectedChain)
          if (!paginationStateLoaded) {
            setCurrentPage(1) // Reset to first page when data changes only if no saved state
          }
          setIsLoading(false)
          setIsSyncing(false)
          return // Exit early if we have cached data
        }
        console.log('❌ No cached favorite vaults found')
      }

      console.log('⛓️ Loading favorite vaults from blockchain...')

      // Get favorites from blockchain
      const favorites = await getFavorites(account.address)
      favoriteVaults = favorites.map(fav => ({
        vaultAddress: fav.vaultAddress as `0x${string}`,
        chainId: fav.chainId,
        coinName: fav.coinName,
        coinSymbol: fav.coinSymbol,
        coinAddress: fav.coinAddress as `0x${string}`,
        decimals: fav.decimals || 18
      }))

      console.log('📊 Total favorite vaults loaded:', favoriteVaults.length)

      // Save to cache after successful blockchain fetch
      try {
        console.log('💾 Saving favorite vaults to cache:', favoriteVaults.length)
        await indexedDBManager.saveFavoriteVaults(account.address, favoriteVaults)
        console.log('✅ Favorite vaults saved to cache successfully')
      } catch (cacheError) {
        console.error('💥 Error saving to cache:', cacheError)
        // Don't throw error, just log it - caching failure shouldn't break the app
      }

      setVaults(favoriteVaults)
      setDataSource('blockchain')
      setLastUpdated(new Date())
      setInitialLoadComplete(true)
      applyFilters(favoriteVaults, searchQuery, selectedChain)
      if (!paginationStateLoaded) {
        setCurrentPage(1) // Reset to first page when data changes only if no saved state
      }
    } catch (error) {
      console.error('💥 Error loading favorite vaults:', error)
      setError('Failed to load favorite vaults. Please try again later.')
      setDataSource(null)
      setLastUpdated(null)
    } finally {
      setIsLoading(false)
      setIsSyncing(false)
    }
  }

  const handleSync = async () => {
    await fetchFavoriteVaultsFromBlockchain(true)
  }

  // Handle clear cache
  const handleClearCache = async () => {
    if (!account.address) return
    
    try {
      console.log('🗑️ Clearing favorite vault cache...')
      await indexedDBManager.saveFavoriteVaults(account.address, [])
      setDataSource(null)
      setLastUpdated(null)
      console.log('✅ Favorite vault cache cleared')
      
      // Refresh data from blockchain
      await fetchFavoriteVaultsFromBlockchain(true)
    } catch (error) {
      console.error('💥 Error clearing cache:', error)
    }
  }

  // Load pagination state from IndexedDB
  const loadPaginationState = async () => {
    try {
      const savedState = await indexedDBManager.getPaginationState('favorites')
      if (savedState) {
        console.log('🔄 Loading saved pagination state for favorites:', savedState)
        setCurrentPage(savedState.page)
        setSearchQuery(savedState.searchQuery)
        setSelectedChain(savedState.selectedChain as SupportedChainId | 'all')
      }
      setPaginationStateLoaded(true)
    } catch (error) {
      console.error('💥 Error loading pagination state:', error)
      setPaginationStateLoaded(true)
    }
  }

  // Save pagination state to IndexedDB
  const savePaginationState = async (page: number, search: string, chain: SupportedChainId | 'all') => {
    try {
      await indexedDBManager.savePaginationState('favorites', {
        page,
        searchQuery: search,
        selectedChain: chain.toString()
      })
      console.log('💾 Saved pagination state for favorites')
    } catch (error) {
      console.error('💥 Error saving pagination state:', error)
    }
  }

  const applyFilters = (vaultList: any[], search: string, chain: SupportedChainId | 'all') => {
    let filtered = vaultList

    // Apply search filter
    if (search.trim() !== '') {
      const lowerCaseQuery = search.toLowerCase()
      filtered = filtered.filter(
        vault =>
          vault.coinName.toLowerCase().includes(lowerCaseQuery) ||
          vault.coinSymbol.toLowerCase().includes(lowerCaseQuery)
      )
    }

    // Apply chain filter
    if (chain !== 'all') {
      filtered = filtered.filter(vault => vault.chainId === chain)
    }

    setFilteredVaults(filtered)
    
    // Update pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    setTotalPages(totalPages)
    
    // Paginate the results
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    setPaginatedVaults(filtered.slice(startIndex, endIndex))
    
    if (!paginationStateLoaded) {
      setCurrentPage(1) // Reset to first page when filters change only if no saved state
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    applyFilters(vaults, query, selectedChain)
    setCurrentPage(1) // Reset to first page when search changes
    savePaginationState(1, query, selectedChain)
  }

  const handleChainSelect = (chainId: SupportedChainId | 'all') => {
    setSelectedChain(chainId)
    applyFilters(vaults, searchQuery, chainId)
    setCurrentPage(1) // Reset to first page when filter changes
    savePaginationState(1, searchQuery, chainId)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    setPaginatedVaults(filteredVaults.slice(startIndex, endIndex))
    savePaginationState(page, searchQuery, selectedChain)
  }

  const getAvailableChains = (): SupportedChainId[] => {
    const chainSet = new Set<SupportedChainId>()
    vaults.forEach(vault => {
      if (vault.chainId) {
        chainSet.add(vault.chainId as SupportedChainId)
      }
    })
    return Array.from(chainSet).sort()
  }

  const getChainName = (chainId: SupportedChainId | 'all') => {
    if (chainId === 'all') return 'All Networks'
    const chainNames: { [key in SupportedChainId]: string } = {
      1: 'Ethereum',
      137: 'Polygon',
      534351: 'Scroll Sepolia',
      5115: 'Citrea Testnet',
      61: 'Ethereum Classic',
      2001: 'Milkomeda',
      8453: 'Base',
    }
    return chainNames[chainId] || `Chain ${chainId}`
  }

  useEffect(() => {
    loadPaginationState()
  }, [])

  useEffect(() => {
    if (paginationStateLoaded) {
      fetchFavoriteVaultsFromBlockchain()
    }
  }, [account.address, paginationStateLoaded])

  // Update pagination when filtered vaults change
  useEffect(() => {
    const totalPages = Math.ceil(filteredVaults.length / ITEMS_PER_PAGE)
    setTotalPages(totalPages)
    
    // Ensure current page is valid
    const validPage = Math.max(1, Math.min(currentPage, totalPages))
    if (validPage !== currentPage) {
      setCurrentPage(validPage)
    }
    
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    setPaginatedVaults(filteredVaults.slice(startIndex, endIndex))
  }, [filteredVaults, currentPage])

  return (
    <div className='min-h-screen page-3d'>
      {/* Streamlined Header */}
      <div className='border-b border-border/40 header-3d mb-8'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20 floating-3d'>
                <Star className='h-6 w-6 text-primary' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-gradient'>Favorite Vaults</h1>
                <p className='text-sm text-muted-foreground'>Your starred vaults across networks</p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className='hidden md:flex items-center gap-3 text-sm'>
              <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-primary/10'>
                <TrendingUp className='h-4 w-4 text-green-500' />
                <span className='font-medium'>{filteredVaults.length}</span>
                <span className='text-muted-foreground'>favorites</span>
              </div>
              <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-primary/10'>
                <Vault className='h-4 w-4 text-blue-500' />
                <span className='font-medium'>{getAvailableChains().length}</span>
                <span className='text-muted-foreground'>networks</span>
              </div>
              <Button
                onClick={handleSync}
                disabled={isLoading || isSyncing}
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
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className='space-y-2'>
                                <h3 className='text-lg font-medium text-gradient'>Connect Your Wallet</h3>
              <p className='text-muted-foreground max-w-md mx-auto'>
                Please connect your wallet to view your favorite vaults
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
                    placeholder='Search favorite vaults...'
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
                          "{searchQuery}"
                        </div>
                      )}
                      {selectedChain !== 'all' && (
                        <div className='flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 text-blue-600'>
                          <Vault className='h-3 w-3' />
                          {getChainName(selectedChain)}
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
              {isLoading && !initialLoadComplete && (
                <Loading variant="vault" message="Loading favorite vaults..." />
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
                      <Star className='h-8 w-8 text-destructive' />
                    </div>
                    <div className='space-y-2'>
                      <h3 className='text-lg font-medium text-gradient'>Error Loading Favorites</h3>
                      <p className='text-muted-foreground max-w-md mx-auto'>{error}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => fetchFavoriteVaultsFromBlockchain(true)}
                      className='mt-4'
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {/* No Favorites State */}
              {initialLoadComplete && vaults.length === 0 && !error && (
                <div className='text-center py-16'>
                  <div className='space-y-4'>
                    <div className='w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center'>
                      <Heart className='h-8 w-8 text-muted-foreground' />
                    </div>
                    <div className='space-y-2'>
                      <h3 className='text-lg font-medium text-gradient'>No Favorite Vaults Yet</h3>
                      <p className='text-muted-foreground max-w-md mx-auto'>
                        Start marking vaults as favorites to see them here
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                      <Link href="/explorer">
                        <Button variant="default">
                          Explore Vaults
                        </Button>
                      </Link>
                      <Link href="/createVault">
                        <Button variant="outline">
                          Create Vault
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* No Results State */}
              {initialLoadComplete && vaults.length > 0 && filteredVaults.length === 0 && (
                <div className='text-center py-16'>
                  <div className='space-y-4'>
                    <div className='w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center'>
                      <Search className='h-8 w-8 text-muted-foreground' />
                    </div>
                    <div className='space-y-2'>
                      <h3 className='text-lg font-medium text-gradient'>No Results Found</h3>
                      <p className='text-muted-foreground max-w-md mx-auto'>
                        No favorite vaults match your current filters. Try adjusting your search terms or network selection.
                      </p>
                    </div>
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
                  </div>
                </div>
              )}

              {/* Vault Grid */}
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
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="button-3d"
                      >
                        Previous
                      </Button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber
                          if (totalPages <= 5) {
                            pageNumber = i + 1
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i
                          } else {
                            pageNumber = currentPage - 2 + i
                          }
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              onClick={() => handlePageChange(pageNumber)}
                              className="w-10 h-10 button-3d"
                            >
                              {pageNumber}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="button-3d"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default FavoriteVaults 