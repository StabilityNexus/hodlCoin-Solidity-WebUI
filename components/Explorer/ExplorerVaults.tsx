'use client'

import { useEffect, useRef, useState } from 'react'
import { vaultsProps } from '@/utils/props'
import CardExplorer from './CardExplorer'
import { readContract, getPublicClient } from '@wagmi/core'
import { config } from '@/utils/config'
import { HodlCoinVaultFactories } from '@/utils/addresses'
import { HodlCoinFactoryAbi } from '@/utils/contracts/HodlCoinFactory'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

export default function ExplorerVaults() {
  const [loading, setLoading] = useState(false)
  const [vaults, setVaults] = useState<vaultsProps[]>([])
  const [filteredVaults, setFilteredVaults] = useState<vaultsProps[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedChain, setSelectedChain] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

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

      if (!selectedChain || selectedChain === 'All chains') {
        // Fetch vaults from all chains in parallel
        const chainIds = Object.keys(HodlCoinVaultFactories).map(Number)
        const vaultPromises = chainIds.map(chainId =>
          fetchVaultsForChain(chainId),
        )
        const results = await Promise.all(vaultPromises)
        allVaults = results.flat()
      } else {
        // Fetch vaults for selected chain only
        const chainId = parseInt(selectedChain)
        allVaults = await fetchVaultsForChain(chainId)
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
  }, [selectedChain])

  const handleSelect = (value: string) => {
    setSelectedChain(value === 'All chains' ? null : value)
    setIsOpen(false)
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

  return (
    <div className='w-full space-y-4'>
      <div className='flex justify-between items-center mb-8'>
        <Select>
          <SelectTrigger
            onClick={() => setIsOpen(prev => !prev)}
            isOpen={isOpen}
            className='w-[200px] dark:bg-zinc-900 bg-white border-none 
            dark:text-purple-50 text-purple-900 
            dark:hover:border-white hover:border-gray-800
            transition-colors duration-200'
          >
            <SelectValue value={selectedChain || 'All chains'} />
          </SelectTrigger>
          <SelectContent
            isOpen={isOpen}
            className='dark:bg-zinc-900 bg-purple-50'
          >
            <SelectItem
              onClick={() => handleSelect('All chains')}
              className='dark:text-purple-50 text-purple-900
              dark:hover:bg-zinc-800 hover:bg-purple-100
              cursor-pointer transition-colors duration-200'
            >
              All chains
            </SelectItem>
            {Object.keys(HodlCoinVaultFactories).map(chain => (
              <SelectItem
                key={chain}
                onClick={() => handleSelect(chain)}
                className='dark:text-purple-50 text-purple-900
                dark:hover:bg-zinc-800 hover:bg-purple-100
                cursor-pointer transition-colors duration-200'
              >
                {chain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className='relative w-[300px]'>
          <Search className='absolute left-3 top-3 h-4 w-4 dark:text-purple-800 text-purple-700' />
          <Input
            placeholder='Search vaults...'
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className='pl-10 
              dark:bg-zinc-900 bg-purple-50 
              dark:text-white text-gray-900 
              dark:placeholder-gray-300 placeholder-gray-900 
              border border-gray-800 dark:border-white 
              rounded-md
              dark:hover:border-purple-400 hover:border-purple-500 
              transition-colors duration-200 h-10'
          />
        </div>
      </div>
      {loading ? (
        <div className='text-center dark:text-purple-50 text-purple-900'>
          Loading vaults...
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto'>
          {filteredVaults.map((vault, index) => (
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
