'use client'

import { Plus, ArrowRight } from 'lucide-react'
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

const VaultDashboard = () => {
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

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12 pt-20">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gradient">
              Your Vaults
            </h1>
            <p className="text-muted-foreground font-medium">
              Manage and monitor your staking vaults across different chains
            </p>
          </div>
          <Link href="/createVault">
            <Button className="btn-gradient font-bold">
              <Plus className="mr-2 h-4 w-4" />
              Create New Vault
            </Button>
          </Link>
        </div>

        {/* Vaults Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-background/50 backdrop-blur-sm border-primary/20">
                <CardHeader className="border-b border-primary/10 pb-3">
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full">
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-6 text-center">
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            </div>
          ) : vaults.length === 0 ? (
            <div className="col-span-full">
              <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">No Vaults Found</h3>
                    <p className="text-muted-foreground">
                      You haven't created any vaults yet. Start by creating your first vault!
                    </p>
                    <Link href="/createVault">
                      <Button className="mt-4">
                        Create Your First Vault
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            vaults.map(vault => (
              <Card
                key={`${vault.chainId}-${vault.vaultAddress}`}
                className="group relative overflow-hidden bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 cursor-pointer"
                onClick={() => handleContinue(vault.chainId, vault.vaultAddress)}
              >
                <CardHeader className="border-b border-primary/10 pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-foreground">{vault.coinName}</span>
                    <span className="text-sm text-muted-foreground">
                      Chain {vault.chainId}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Price of 1 {vault.coinSymbol}
                      </span>
                      <span className="text-lg font-semibold text-primary">
                        {vault.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default VaultDashboard
