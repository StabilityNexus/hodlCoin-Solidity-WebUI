import { vaultsProps } from './props'

export interface PaginationData {
  page: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface PaginationResult<T> {
  data: T[]
  pagination: PaginationData
}

export const paginateArray = <T>(
  items: T[],
  page: number,
  itemsPerPage: number = 6
): PaginationResult<T> => {
  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const data = items.slice(startIndex, endIndex)

  return {
    data,
    pagination: {
      page,
      totalPages,
      totalItems,
      itemsPerPage
    }
  }
}

interface CachedVaultData {
  vaults: vaultsProps[]
  timestamp: number
  chainId: string | number
}

interface CachedUserData {
  userAddress: string
  vaults: any[]
  timestamp: number
}

interface CachedFavoriteData {
  userAddress: string
  vaults: vaultsProps[]
  timestamp: number
}

interface PaginationState {
  page: number
  searchQuery: string
  selectedChain: string
  timestamp: number
}

interface IndividualVaultDetails {
  vaultAddress: string
  chainId: number
  details: any
  timestamp: number
}

class IndexedDBManager {
  private dbName = 'HodlCoinVaultsDB'
  private version = 2
  private db: IDBDatabase | null = null
  private cacheExpirationTime = 15 * 60 * 1000 // 15 minutes in milliseconds
  private initPromise: Promise<void> | null = null

  async init(): Promise<void> {
    // Prevent multiple initialization attempts
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (this.db) {
        console.log('✅ IndexedDB already initialized')
        resolve()
        return
      }

      // Check if IndexedDB is supported
      if (!window.indexedDB) {
        console.error('💥 IndexedDB not supported in this browser')
        reject(new Error('IndexedDB not supported'))
        return
      }

      console.log('🚀 Initializing IndexedDB...')
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error('💥 IndexedDB error:', request.error)
        this.initPromise = null // Reset so we can try again
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('✅ IndexedDB initialized successfully')
        
        // Handle unexpected database closure
        this.db.onclose = () => {
          console.warn('⚠️ IndexedDB connection closed unexpectedly')
          this.db = null
          this.initPromise = null
        }

        this.db.onerror = (event) => {
          console.error('💥 IndexedDB error:', event)
        }

        resolve()
      }

      request.onupgradeneeded = (event) => {
        console.log('🏗️ Upgrading IndexedDB schema...')
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object stores
        if (!db.objectStoreNames.contains('explorerVaults')) {
          const explorerStore = db.createObjectStore('explorerVaults', { keyPath: 'chainId' })
          explorerStore.createIndex('timestamp', 'timestamp', { unique: false })
          console.log('🏗️ Created explorerVaults store')
        }

        if (!db.objectStoreNames.contains('userVaults')) {
          const userStore = db.createObjectStore('userVaults', { keyPath: 'userAddress' })
          userStore.createIndex('timestamp', 'timestamp', { unique: false })
          console.log('🏗️ Created userVaults store')
        }

        if (!db.objectStoreNames.contains('favoriteVaults')) {
          const favoriteStore = db.createObjectStore('favoriteVaults', { keyPath: 'userAddress' })
          favoriteStore.createIndex('timestamp', 'timestamp', { unique: false })
          console.log('🏗️ Created favoriteVaults store')
        }

        if (!db.objectStoreNames.contains('paginationStates')) {
          const paginationStore = db.createObjectStore('paginationStates', { keyPath: 'id' })
          paginationStore.createIndex('timestamp', 'timestamp', { unique: false })
          console.log('🏗️ Created paginationStates store')
        }

        if (!db.objectStoreNames.contains('individualVaults')) {
          const individualStore = db.createObjectStore('individualVaults', { keyPath: 'id' })
          individualStore.createIndex('vaultAddress', 'vaultAddress', { unique: false })
          individualStore.createIndex('chainId', 'chainId', { unique: false })
          individualStore.createIndex('timestamp', 'timestamp', { unique: false })
          console.log('🏗️ Created individualVaults store')
        }
      }

      request.onblocked = () => {
        console.warn('⚠️ IndexedDB upgrade blocked. Please close other tabs.')
      }
    })

    return this.initPromise
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init()
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB')
    }
    return this.db
  }

  private isDataExpired(timestamp: number): boolean {
    const isExpired = Date.now() - timestamp > this.cacheExpirationTime
    if (isExpired) {
      console.log('⏰ Data expired. Age:', Math.round((Date.now() - timestamp) / 1000 / 60), 'minutes')
    }
    return isExpired
  }

  // Explorer Vaults Methods
  async saveExplorerVaults(chainId: string | number, vaults: vaultsProps[]): Promise<void> {
    try {
      console.log('💾 Attempting to save explorer vaults for chain:', chainId, 'Count:', vaults.length)
      const db = await this.ensureDB()
      const transaction = db.transaction(['explorerVaults'], 'readwrite')
      const store = transaction.objectStore('explorerVaults')

      const data: CachedVaultData = {
        chainId: chainId.toString(),
        vaults,
        timestamp: Date.now()
      }

      await new Promise<void>((resolve, reject) => {
        const request = store.put(data)
        request.onsuccess = () => {
          console.log('✅ Explorer vaults saved successfully for chain:', chainId)
          resolve()
        }
        request.onerror = () => {
          console.error('💥 Error saving explorer vaults:', request.error)
          reject(request.error)
        }
      })

      // Wait for transaction to complete
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      })

    } catch (error) {
      console.error('💥 IndexedDB save error for explorer vaults:', error)
      throw error
    }
  }

  async getExplorerVaults(chainId: string | number): Promise<vaultsProps[] | null> {
    try {
      console.log('🔍 Attempting to get explorer vaults for chain:', chainId)
      const db = await this.ensureDB()
      const transaction = db.transaction(['explorerVaults'], 'readonly')
      const store = transaction.objectStore('explorerVaults')

      return new Promise<vaultsProps[] | null>((resolve, reject) => {
        const request = store.get(chainId.toString())
        
        request.onsuccess = () => {
          const result = request.result as CachedVaultData | undefined
          
          if (!result) {
            console.log('❌ No cached data found for chain:', chainId)
            resolve(null)
            return
          }

          console.log('📦 Found cached data for chain:', chainId, 'Age:', Math.round((Date.now() - result.timestamp) / 1000 / 60), 'minutes')

          if (this.isDataExpired(result.timestamp)) {
            console.log('⏰ Cached data expired for chain:', chainId)
            resolve(null)
            return
          }

          console.log('✅ Retrieved cached explorer vaults for chain:', chainId, 'Count:', result.vaults.length)
          resolve(result.vaults)
        }

        request.onerror = () => {
          console.error('💥 Error retrieving explorer vaults:', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('💥 IndexedDB get error for explorer vaults:', error)
      return null
    }
  }

  // User Vaults Methods
  async saveUserVaults(userAddress: string, vaults: any[]): Promise<void> {
    try {
      console.log('💾 Attempting to save user vaults for address:', userAddress, 'Count:', vaults.length)
      const db = await this.ensureDB()
      const transaction = db.transaction(['userVaults'], 'readwrite')
      const store = transaction.objectStore('userVaults')

      const data: CachedUserData = {
        userAddress: userAddress.toLowerCase(),
        vaults,
        timestamp: Date.now()
      }

      await new Promise<void>((resolve, reject) => {
        const request = store.put(data)
        request.onsuccess = () => {
          console.log('✅ User vaults saved successfully for address:', userAddress)
          resolve()
        }
        request.onerror = () => {
          console.error('💥 Error saving user vaults:', request.error)
          reject(request.error)
        }
      })

      // Wait for transaction to complete
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      })

    } catch (error) {
      console.error('💥 IndexedDB save error for user vaults:', error)
      throw error
    }
  }

  async getUserVaults(userAddress: string): Promise<any[] | null> {
    try {
      console.log('🔍 Attempting to get user vaults for address:', userAddress)
      const db = await this.ensureDB()
      const transaction = db.transaction(['userVaults'], 'readonly')
      const store = transaction.objectStore('userVaults')

      return new Promise<any[] | null>((resolve, reject) => {
        const request = store.get(userAddress.toLowerCase())
        
        request.onsuccess = () => {
          const result = request.result as CachedUserData | undefined
          
          if (!result) {
            console.log('❌ No cached user vaults found for:', userAddress)
            resolve(null)
            return
          }

          console.log('📦 Found cached user data for:', userAddress, 'Age:', Math.round((Date.now() - result.timestamp) / 1000 / 60), 'minutes')

          if (this.isDataExpired(result.timestamp)) {
            console.log('⏰ Cached user vaults expired for:', userAddress)
            resolve(null)
            return
          }

          console.log('✅ Retrieved cached user vaults for:', userAddress, 'Count:', result.vaults.length)
          resolve(result.vaults)
        }

        request.onerror = () => {
          console.error('💥 Error retrieving user vaults:', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('💥 IndexedDB get error for user vaults:', error)
      return null
    }
  }

  // Favorite Vaults Methods
  async saveFavoriteVaults(userAddress: string, vaults: vaultsProps[]): Promise<void> {
    try {
      console.log('💾 Attempting to save favorite vaults for address:', userAddress, 'Count:', vaults.length)
      const db = await this.ensureDB()
      const transaction = db.transaction(['favoriteVaults'], 'readwrite')
      const store = transaction.objectStore('favoriteVaults')

      const data: CachedFavoriteData = {
        userAddress: userAddress.toLowerCase(),
        vaults,
        timestamp: Date.now()
      }

      await new Promise<void>((resolve, reject) => {
        const request = store.put(data)
        request.onsuccess = () => {
          console.log('✅ Favorite vaults saved successfully for address:', userAddress)
          resolve()
        }
        request.onerror = () => {
          console.error('💥 Error saving favorite vaults:', request.error)
          reject(request.error)
        }
      })

      // Wait for transaction to complete
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      })

    } catch (error) {
      console.error('💥 IndexedDB save error for favorite vaults:', error)
      throw error
    }
  }

  async getFavoriteVaults(userAddress: string): Promise<vaultsProps[] | null> {
    try {
      console.log('🔍 Attempting to get favorite vaults for address:', userAddress)
      const db = await this.ensureDB()
      const transaction = db.transaction(['favoriteVaults'], 'readonly')
      const store = transaction.objectStore('favoriteVaults')

      return new Promise<vaultsProps[] | null>((resolve, reject) => {
        const request = store.get(userAddress.toLowerCase())
        
        request.onsuccess = () => {
          const result = request.result as CachedFavoriteData | undefined
          
          if (!result) {
            console.log('❌ No cached favorite vaults found for:', userAddress)
            resolve(null)
            return
          }

          console.log('📦 Found cached favorite data for:', userAddress, 'Age:', Math.round((Date.now() - result.timestamp) / 1000 / 60), 'minutes')

          if (this.isDataExpired(result.timestamp)) {
            console.log('⏰ Cached favorite vaults expired for:', userAddress)
            resolve(null)
            return
          }

          console.log('✅ Retrieved cached favorite vaults for:', userAddress, 'Count:', result.vaults.length)
          resolve(result.vaults)
        }

        request.onerror = () => {
          console.error('💥 Error retrieving favorite vaults:', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('💥 IndexedDB get error for favorite vaults:', error)
      return null
    }
  }

  // Pagination State Methods
  async savePaginationState(page: string, state: { page: number, searchQuery: string, selectedChain: string }): Promise<void> {
    try {
      console.log('💾 Saving pagination state for page:', page, state)
      const db = await this.ensureDB()
      const transaction = db.transaction(['paginationStates'], 'readwrite')
      const store = transaction.objectStore('paginationStates')

      const data: PaginationState & { id: string } = {
        id: page,
        page: state.page,
        searchQuery: state.searchQuery,
        selectedChain: state.selectedChain,
        timestamp: Date.now()
      }

      await new Promise<void>((resolve, reject) => {
        const request = store.put(data)
        request.onsuccess = () => {
          console.log('✅ Pagination state saved successfully for page:', page)
          resolve()
        }
        request.onerror = () => {
          console.error('💥 Error saving pagination state:', request.error)
          reject(request.error)
        }
      })

    } catch (error) {
      console.error('💥 IndexedDB save error for pagination state:', error)
      throw error
    }
  }

  async getPaginationState(page: string): Promise<{ page: number, searchQuery: string, selectedChain: string } | null> {
    try {
      console.log('🔍 Getting pagination state for page:', page)
      const db = await this.ensureDB()
      const transaction = db.transaction(['paginationStates'], 'readonly')
      const store = transaction.objectStore('paginationStates')

      return new Promise<{ page: number, searchQuery: string, selectedChain: string } | null>((resolve, reject) => {
        const request = store.get(page)
        
        request.onsuccess = () => {
          const result = request.result as (PaginationState & { id: string }) | undefined
          
          if (!result) {
            console.log('❌ No pagination state found for page:', page)
            resolve(null)
            return
          }

          // Don't expire pagination states - they should persist across sessions
          console.log('✅ Retrieved pagination state for page:', page, result)
          resolve({
            page: result.page,
            searchQuery: result.searchQuery,
            selectedChain: result.selectedChain
          })
        }

        request.onerror = () => {
          console.error('💥 Error retrieving pagination state:', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('💥 IndexedDB get error for pagination state:', error)
      return null
    }
  }

  // Individual Vault Details Methods
  async saveIndividualVaultDetails(vaultAddress: string, chainId: number, details: any): Promise<void> {
    try {
      console.log('💾 Saving individual vault details:', vaultAddress, chainId)
      const db = await this.ensureDB()
      const transaction = db.transaction(['individualVaults'], 'readwrite')
      const store = transaction.objectStore('individualVaults')

      const data: IndividualVaultDetails & { id: string } = {
        id: `${vaultAddress}_${chainId}`,
        vaultAddress: vaultAddress.toLowerCase(),
        chainId,
        details,
        timestamp: Date.now()
      }

      await new Promise<void>((resolve, reject) => {
        const request = store.put(data)
        request.onsuccess = () => {
          console.log('✅ Individual vault details saved successfully:', vaultAddress)
          resolve()
        }
        request.onerror = () => {
          console.error('💥 Error saving individual vault details:', request.error)
          reject(request.error)
        }
      })

    } catch (error) {
      console.error('💥 IndexedDB save error for individual vault details:', error)
      throw error
    }
  }

  async getIndividualVaultDetails(vaultAddress: string, chainId: number): Promise<any | null> {
    try {
      console.log('🔍 Getting individual vault details:', vaultAddress, chainId)
      const db = await this.ensureDB()
      const transaction = db.transaction(['individualVaults'], 'readonly')
      const store = transaction.objectStore('individualVaults')

      return new Promise<any | null>((resolve, reject) => {
        const request = store.get(`${vaultAddress}_${chainId}`)
        
        request.onsuccess = () => {
          const result = request.result as (IndividualVaultDetails & { id: string }) | undefined
          
          if (!result) {
            console.log('❌ No individual vault details found for:', vaultAddress, chainId)
            resolve(null)
            return
          }

          console.log('📦 Found individual vault details for:', vaultAddress, 'Age:', Math.round((Date.now() - result.timestamp) / 1000 / 60), 'minutes')

          if (this.isDataExpired(result.timestamp)) {
            console.log('⏰ Individual vault details expired for:', vaultAddress)
            resolve(null)
            return
          }

          console.log('✅ Retrieved individual vault details for:', vaultAddress)
          resolve(result.details)
        }

        request.onerror = () => {
          console.error('💥 Error retrieving individual vault details:', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('💥 IndexedDB get error for individual vault details:', error)
      return null
    }
  }

  // Clear cached data for a specific individual vault
  async clearIndividualVaultDetails(vaultAddress: string, chainId: number): Promise<void> {
    try {
      console.log('🗑️ Clearing individual vault details cache:', vaultAddress, chainId)
      const db = await this.ensureDB()
      const transaction = db.transaction(['individualVaults'], 'readwrite')
      const store = transaction.objectStore('individualVaults')

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(`${vaultAddress}_${chainId}`)
        request.onsuccess = () => {
          console.log('✅ Individual vault details cache cleared:', vaultAddress)
          resolve()
        }
        request.onerror = () => {
          console.error('💥 Error clearing individual vault details cache:', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('💥 IndexedDB clear error for individual vault details:', error)
      throw error
    }
  }

  // Debug method to check database status
  async debugDatabaseStatus(): Promise<void> {
    try {
      console.log('🔍 Debugging IndexedDB status...')
      const db = await this.ensureDB()
      
      console.log('📊 Database info:', {
        name: db.name,
        version: db.version,
        objectStoreNames: Array.from(db.objectStoreNames)
      })

      // Check explorer vaults
      const explorerTransaction = db.transaction(['explorerVaults'], 'readonly')
      const explorerStore = explorerTransaction.objectStore('explorerVaults')
      const explorerCount = await new Promise<number>((resolve) => {
        const request = explorerStore.count()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => resolve(0)
      })

      // Check user vaults
      const userTransaction = db.transaction(['userVaults'], 'readonly')
      const userStore = userTransaction.objectStore('userVaults')
      const userCount = await new Promise<number>((resolve) => {
        const request = userStore.count()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => resolve(0)
      })

      // Check favorite vaults
      const favoriteTransaction = db.transaction(['favoriteVaults'], 'readonly')
      const favoriteStore = favoriteTransaction.objectStore('favoriteVaults')
      const favoriteCount = await new Promise<number>((resolve) => {
        const request = favoriteStore.count()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => resolve(0)
      })

      // Check pagination states
      const paginationTransaction = db.transaction(['paginationStates'], 'readonly')
      const paginationStore = paginationTransaction.objectStore('paginationStates')
      const paginationCount = await new Promise<number>((resolve) => {
        const request = paginationStore.count()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => resolve(0)
      })

      // Check individual vaults
      const individualTransaction = db.transaction(['individualVaults'], 'readonly')
      const individualStore = individualTransaction.objectStore('individualVaults')
      const individualCount = await new Promise<number>((resolve) => {
        const request = individualStore.count()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => resolve(0)
      })

      console.log('📈 Cache statistics:', {
        explorerVaultsCount: explorerCount,
        userVaultsCount: userCount,
        favoriteVaultsCount: favoriteCount,
        paginationStatesCount: paginationCount,
        individualVaultsCount: individualCount
      })

    } catch (error) {
      console.error('💥 Error debugging database:', error)
    }
  }

  // Test method to verify IndexedDB functionality
  async testIndexedDB(): Promise<boolean> {
    try {
      console.log('🧪 Testing IndexedDB functionality...')
      
      // Test saving and retrieving explorer vaults
      const testVaults: vaultsProps[] = [{
        vaultAddress: '0xtest',
        coinName: 'Test Coin',
        coinAddress: '0xtest123',
        coinSymbol: 'TEST',
        chainId: 999,
        decimals: 18
      }]

      await this.saveExplorerVaults('test', testVaults)
      const retrievedVaults = await this.getExplorerVaults('test')
      
      if (retrievedVaults && retrievedVaults.length === 1) {
        console.log('✅ IndexedDB test passed!')
        
        // Clean up test data
        const db = await this.ensureDB()
        const transaction = db.transaction(['explorerVaults'], 'readwrite')
        const store = transaction.objectStore('explorerVaults')
        store.delete('test')
        
        return true
      } else {
        console.error('❌ IndexedDB test failed - data not retrieved correctly')
        return false
      }
    } catch (error) {
      console.error('❌ IndexedDB test failed with error:', error)
      return false
    }
  }

  // Clear expired data
  async clearExpiredData(): Promise<void> {
    try {
      console.log('🧹 Clearing expired data...')
      const db = await this.ensureDB()
      const transaction = db.transaction(['explorerVaults', 'userVaults', 'favoriteVaults', 'individualVaults'], 'readwrite')
      
      // Clear expired explorer vaults
      const explorerStore = transaction.objectStore('explorerVaults')
      const explorerRequest = explorerStore.openCursor()
      
      explorerRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const data = cursor.value as CachedVaultData
          if (this.isDataExpired(data.timestamp)) {
            cursor.delete()
            console.log('🗑️ Deleted expired explorer data for chain:', data.chainId)
          }
          cursor.continue()
        }
      }

      // Clear expired user vaults
      const userStore = transaction.objectStore('userVaults')
      const userRequest = userStore.openCursor()
      
      userRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const data = cursor.value as CachedUserData
          if (this.isDataExpired(data.timestamp)) {
            cursor.delete()
            console.log('🗑️ Deleted expired user data for:', data.userAddress)
          }
          cursor.continue()
        }
      }

      // Clear expired favorite vaults
      const favoriteStore = transaction.objectStore('favoriteVaults')
      const favoriteRequest = favoriteStore.openCursor()
      
      favoriteRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const data = cursor.value as CachedFavoriteData
          if (this.isDataExpired(data.timestamp)) {
            cursor.delete()
            console.log('🗑️ Deleted expired favorite data for:', data.userAddress)
          }
          cursor.continue()
        }
      }

      // Clear expired individual vault details
      const individualStore = transaction.objectStore('individualVaults')
      const individualRequest = individualStore.openCursor()
      
      individualRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const data = cursor.value as IndividualVaultDetails & { id: string }
          if (this.isDataExpired(data.timestamp)) {
            cursor.delete()
            console.log('🗑️ Deleted expired individual vault data for:', data.vaultAddress)
          }
          cursor.continue()
        }
      }
    } catch (error) {
      console.error('💥 Error clearing expired data:', error)
    }
  }
}

// Create singleton instance
export const indexedDBManager = new IndexedDBManager()

// Initialize on import (only in browser)
if (typeof window !== 'undefined') {
  indexedDBManager.init()
    .then(async () => {
      console.log('🎉 IndexedDB manager ready')
      
      // Run test to verify functionality
      const testPassed = await indexedDBManager.testIndexedDB()
      if (testPassed) {
        console.log('🎯 IndexedDB is working correctly')
      } else {
        console.warn('⚠️ IndexedDB test failed - caching may not work properly')
      }
      
      // Debug database status
      await indexedDBManager.debugDatabaseStatus()
    })
    .catch((error) => {
      console.error('💥 Failed to initialize IndexedDB manager:', error)
    })
} 