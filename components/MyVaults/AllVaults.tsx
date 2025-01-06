'use client'

import { Plus } from 'lucide-react'
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
    <div className='w-full space-y-4 pt-20'>
      <div className='mx-auto max-w-7xl mb-14'>
        <div className='mb-8 flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white md:text-3xl'>
            Your Vaults
          </h1>
          <Link href='/createVault'>
            <Button className='border border-black dark:border-white dark:bg-gray-50 bg-white hover:border-purple-600 hover:dark:border-purple-400'>
              <Plus className='mr-2 h-4 w-4' />
              New Vault
            </Button>
          </Link>
        </div>
      </div>
      <div className='mx-auto max-w-6xl'>
        {isLoading ? (
          <div className='text-center text-white'>Loading vaults...</div>
        ) : error ? (
          <div className='text-center text-red-500'>{error}</div>
        ) : vaults.length === 0 ? (
          <div className='text-center text-white'>No vaults found</div>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {vaults.map(vault => (
              <Card
                key={`${vault.chainId}-${vault.vaultAddress}`}
                className='group relative overflow-hidden dark:bg-zinc-900 bg-white transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer'
                onClick={() =>
                  handleContinue(vault.chainId, vault.vaultAddress)
                }
              >
                <CardHeader className='border-b border-zinc-800 pb-3'>
                  <CardTitle className='text-gray-900 dark:text-zinc-100'>
                    {vault.coinName}
                    <span className='ml-2 text-sm text-zinc-500'>
                      (Chain: {vault.chainId})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-6'>
                  <div className='flex items-baseline justify-between space-x-4'>
                    <p className='text-sm text-purple-800 dark:text-purple-400 whitespace-nowrap'>
                      Price of 1 {vault.coinSymbol}
                    </p>
                    <p className='text-sm text-yellow-500'>{vault.price}</p>
                  </div>
                  <div className='absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 to-yellow-500 opacity-0 transition-opacity group-hover:opacity-100' />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VaultDashboard
