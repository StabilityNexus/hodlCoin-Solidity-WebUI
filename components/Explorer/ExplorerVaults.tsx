'use client'

import { useEffect, useState } from 'react'
import { vaultsProps } from '@/utils/props'
import CardExplorer from './CardExplorer'
import { readContract } from '@wagmi/core'
import { config } from '@/utils/config'
import { HodlCoinVaultFactories } from '@/utils/addresses'
import { HodlCoinFactoryAbi } from '@/utils/contracts/HodlCoinFactory'

export default function ExplorerVaults() {
  const [loading, setLoading] = useState(false)
  const [vaults, setVaults] = useState<vaultsProps[]>([])

  const getVaults = async () => {
    try {
      setLoading(true)
      const chainId = config.state.chainId

      const totalVaults = (await readContract(config as any, {
        abi: HodlCoinFactoryAbi,
        address: HodlCoinVaultFactories[chainId],
        functionName: 'vaultId',
        args: [],
      })) as bigint

      const vaultPromises = []
      for (let i = 1; i <= Number(totalVaults); i++) {
        vaultPromises.push(
          readContract(config as any, {
            abi: HodlCoinFactoryAbi,
            address: HodlCoinVaultFactories[chainId],
            functionName: 'vaults',
            args: [BigInt(i)],
          }),
        )
      }

      const allVaults = await Promise.all(vaultPromises)

      const formattedVaults = allVaults.map((vault: any) => ({
        vaultAddress: vault[0],
        coinName: vault[1],
        coinAddress: vault[2],
        coinSymbol: vault[3],
      }))

      setVaults(formattedVaults)
    } catch (err) {
      console.error('Error getting vaults:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getVaults()
  }, [])

  return (
    <div className='w-full space-y-4'>
      {loading ? (
        <div className='text-center'>Loading vaults...</div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto'>
          {vaults.map((vault, index) => (
            <CardExplorer
              key={`${vault.vaultAddress}-${index}`}
              vault={vault}
            />
          ))}
        </div>
      )}
    </div>
  )
}
