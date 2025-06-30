import { vaultsProps } from './props'
import { writeContract, readContract, getPublicClient } from '@wagmi/core'
import { config } from './config'
import { HodlCoinFactoryAbi } from './contracts/HodlCoinFactory'
import { HodlCoinVaultFactories } from './addresses'
import { HodlCoinAbi } from './contracts/HodlCoin'

export interface FavoriteVault {
  vaultAddress: string
  chainId: number
  coinName: string
  coinSymbol: string
  coinAddress: string
  decimals?: number
  addedAt?: number
}

export class FavoritesManager {
  private static instance: FavoritesManager

  private constructor() {}

  static getInstance(): FavoritesManager {
    if (!FavoritesManager.instance) {
      FavoritesManager.instance = new FavoritesManager()
    }
    return FavoritesManager.instance
  }

  async addFavorite(vault: vaultsProps, userAddress: string): Promise<void> {
    try {
      console.log('⭐ Adding favorite to blockchain:', vault.coinName, 'on chain', vault.chainId)
      
      const factoryAddress = HodlCoinVaultFactories[vault.chainId]
      if (!factoryAddress) {
        throw new Error(`Factory not found for chain ${vault.chainId}`)
      }

      const tx = await writeContract(config as any, {
        address: factoryAddress,
        abi: HodlCoinFactoryAbi,
        functionName: 'addInteraction',
        args: [userAddress as `0x${string}`, vault.vaultAddress],
      })

      console.log('✅ Favorite added to blockchain:', tx)
    } catch (error) {
      console.error('❌ Error adding favorite to blockchain:', error)
      throw error
    }
  }

  async removeFavorite(vaultAddress: string, chainId: number): Promise<void> {
    try {
      console.log('🗑️ Removing favorite from blockchain:', vaultAddress, 'on chain', chainId)
      
      const factoryAddress = HodlCoinVaultFactories[chainId]
      if (!factoryAddress) {
        throw new Error(`Factory not found for chain ${chainId}`)
      }

      const tx = await writeContract(config as any, {
        address: factoryAddress,
        abi: HodlCoinFactoryAbi,
        functionName: 'removeInteraction',
        args: [vaultAddress as `0x${string}`],
      })

      console.log('✅ Favorite removed from blockchain:', tx)
    } catch (error) {
      console.error('❌ Error removing favorite from blockchain:', error)
      throw error
    }
  }

  async isFavorite(vaultAddress: string, chainId: number, userAddress: string): Promise<boolean> {
    try {
      const factoryAddress = HodlCoinVaultFactories[chainId]
      if (!factoryAddress) {
        return false
      }

      const publicClient = getPublicClient(config as any, { chainId })
      if (!publicClient) {
        return false
      }

      const isInteracted = await publicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: HodlCoinFactoryAbi,
        functionName: 'userInteractedVaultsHistory',
        args: [userAddress as `0x${string}`, vaultAddress as `0x${string}`],
      })

      return Boolean(isInteracted)
    } catch (error) {
      console.error('❌ Error checking favorite status:', error)
      return false
    }
  }

  async getFavorites(userAddress: string): Promise<FavoriteVault[]> {
    try {
      console.log('🔍 Fetching favorites from blockchain for user:', userAddress)
      
      const allFavorites: FavoriteVault[] = []

      // Fetch from all supported chains
      const chainPromises = Object.entries(HodlCoinVaultFactories).map(
        async ([chainId, factoryAddress]) => {
          try {
            const publicClient = getPublicClient(config as any, { chainId: parseInt(chainId) })
            if (!publicClient) {
              console.warn(`No public client for chain ${chainId}`)
              return []
            }

            // Get user's interacted vaults using slice function
            // First, we need to get the length by trying to read indices until we get an error
            let vaultCount = 0
            try {
              // Try to read indices to find the length
              while (true) {
                await publicClient.readContract({
                  address: factoryAddress as `0x${string}`,
                  abi: HodlCoinFactoryAbi,
                  functionName: 'userInteractedVaults',
                  args: [userAddress as `0x${string}`, BigInt(vaultCount)],
                })
                vaultCount++
                if (vaultCount > 1000) break // Safety limit
              }
            } catch {
              // Count is now the actual length
            }

            if (vaultCount === 0) {
              return []
            }

            // Get all user's interacted vaults using slice function
            const userVaults = await publicClient.readContract({
              address: factoryAddress as `0x${string}`,
              abi: HodlCoinFactoryAbi,
              functionName: 'getUserInteractedVaultsSlice',
              args: [userAddress as `0x${string}`, BigInt(0), BigInt(vaultCount - 1)],
            }) as `0x${string}`[]

            // Get vault details for each vault
            const vaultPromises = userVaults.map(async (vaultAddress) => {
              try {
                // Get vault details from factory
                let vaultDetails = null
                const totalVaults = await publicClient.readContract({
                  address: factoryAddress as `0x${string}`,
                  abi: HodlCoinFactoryAbi,
                  functionName: 'vaultId',
                }) as bigint

                // Find vault by address
                for (let i = 1; i <= Number(totalVaults); i++) {
                  const vault = await publicClient.readContract({
                    address: factoryAddress as `0x${string}`,
                    abi: HodlCoinFactoryAbi,
                    functionName: 'vaults',
                    args: [BigInt(i)],
                  }) as unknown as readonly [`0x${string}`, string, `0x${string}`, string]

                  if (vault[0].toLowerCase() === vaultAddress.toLowerCase()) {
                    vaultDetails = vault
                    break
                  }
                }

                if (!vaultDetails) {
                  console.warn(`Vault details not found for ${vaultAddress}`)
                  return null
                }

                return {
                  vaultAddress: vaultDetails[0],
                  chainId: parseInt(chainId),
                  coinName: vaultDetails[1],
                  coinSymbol: vaultDetails[3],
                  coinAddress: vaultDetails[2],
                  decimals: 18,
                } as FavoriteVault
              } catch (error) {
                console.error(`Error fetching vault details for ${vaultAddress}:`, error)
                return null
              }
            })

            const results = await Promise.all(vaultPromises)
            return results.filter((vault): vault is FavoriteVault => vault !== null)
          } catch (error) {
            console.error(`Error fetching favorites from chain ${chainId}:`, error)
            return []
          }
        }
      )

      const results = await Promise.all(chainPromises)
      allFavorites.push(...results.flat())

      console.log('📊 Total favorites fetched from blockchain:', allFavorites.length)
      return allFavorites
    } catch (error) {
      console.error('❌ Error fetching favorites from blockchain:', error)
      return []
    }
  }

  async getFavoritesByChain(chainId: number, userAddress: string): Promise<FavoriteVault[]> {
    const allFavorites = await this.getFavorites(userAddress)
    return allFavorites.filter(fav => fav.chainId === chainId)
  }

  async getFavoritesCount(userAddress: string): Promise<number> {
    const favorites = await this.getFavorites(userAddress)
    return favorites.length
  }

  // Convert FavoriteVault to vaultsProps for compatibility
  convertToVaultProps(favorite: FavoriteVault): vaultsProps {
    return {
      vaultAddress: favorite.vaultAddress as `0x${string}`,
      chainId: favorite.chainId,
      coinName: favorite.coinName,
      coinSymbol: favorite.coinSymbol,
      coinAddress: favorite.coinAddress as `0x${string}`,
      decimals: favorite.decimals || 18
    }
  }
}

// Export singleton instance
export const favoritesManager = FavoritesManager.getInstance()

// Hook for React components
export const useFavorites = () => {
  const addFavorite = async (vault: vaultsProps, userAddress: string) => {
    await favoritesManager.addFavorite(vault, userAddress)
  }

  const removeFavorite = async (vaultAddress: string, chainId: number) => {
    await favoritesManager.removeFavorite(vaultAddress, chainId)
  }

  const isFavorite = async (vaultAddress: string, chainId: number, userAddress: string) => {
    return await favoritesManager.isFavorite(vaultAddress, chainId, userAddress)
  }

  const toggleFavorite = async (vault: vaultsProps, userAddress: string) => {
    const isCurrentlyFavorite = await favoritesManager.isFavorite(vault.vaultAddress, vault.chainId, userAddress)
    
    if (isCurrentlyFavorite) {
      await favoritesManager.removeFavorite(vault.vaultAddress, vault.chainId)
      return false
    } else {
      await favoritesManager.addFavorite(vault, userAddress)
      return true
    }
  }

  const getFavorites = async (userAddress: string) => {
    return await favoritesManager.getFavorites(userAddress)
  }

  const getFavoritesCount = async (userAddress: string) => {
    return await favoritesManager.getFavoritesCount(userAddress)
  }

  return {
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    getFavorites,
    getFavoritesCount
  }
} 