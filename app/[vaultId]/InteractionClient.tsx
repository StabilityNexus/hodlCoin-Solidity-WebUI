'use client'

import { Coins } from 'lucide-react'
import ActionsVault from '@/components/Vault/Actions'
import HeroVault from '@/components/Vault/HeroVault'
import VaultInformation from '@/components/Vault/VaultInformation'
import { ERC20Abi } from '@/utils/contracts/ERC20'
import { vaultsProps } from '@/utils/props'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { readContract, getPublicClient } from '@wagmi/core'
import { config } from '@/utils/config'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { useSearchParams } from 'next/navigation'

export default function InteractionClient() {
  const searchParams = useSearchParams()
  const account = useAccount()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [chainId, setChainId] = useState<number>(0)
  const [vaultAddress, setVaultAddress] = useState<`0x${string}`>('0x0')
  const [vaultCreator, setVaultCreator] = useState<`0x${string}`>('0x0')
  const [coinAddress, setCoinAddress] = useState<`0x${string}`>('0x0')
  const [coinName, setCoinName] = useState<string>('')
  const [coinSymbol, setCoinSymbol] = useState<string>('')

  const [vault, setVault] = useState<vaultsProps>({
    coinAddress: '0x0' as `0x${string}`,
    coinName: '',
    coinSymbol: '',
    vaultAddress: '0x0' as `0x${string}`,
    chainId: 0,
  })

  const [balances, setBalances] = useState({
    coinBalance: 0,
    hodlCoinBalance: 0,
    coinReserve: 0,
    hodlCoinSupply: 0,
    priceHodl: 0,
  })

  const [fees, setFees] = useState({
    vaultFee: 0,
    vaultCreatorFee: 0,
    stableOrderFee: 0,
  })

  useEffect(() => {
    const vault = searchParams.get('vault')
    const chain = searchParams.get('chainId')

    if (vault && chain) {
      setVaultAddress(vault as `0x${string}`)
      setChainId(Number(chain))
    }
  }, [searchParams])

  const getVaultsData = async () => {
    if (!vaultAddress || !chainId) {
      setError('Invalid vault address or chain ID')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Get chain-specific public client
      const publicClient = getPublicClient(config, { chainId })

      if (!publicClient) {
        throw new Error(`No public client available for chain ${chainId}`)
      }

      // Get coin address and vault creator
      const [newCoinAddress, newVaultCreator] = await Promise.all([
        publicClient.readContract({
          abi: HodlCoinAbi,
          address: vaultAddress,
          functionName: 'coin',
        }),
        publicClient.readContract({
          abi: HodlCoinAbi,
          address: vaultAddress,
          functionName: 'vaultCreator',
        }),
      ])

      // Get token details
      const [name, symbol] = await Promise.all([
        publicClient.readContract({
          abi: ERC20Abi,
          address: newCoinAddress as `0x${string}`,
          functionName: 'name',
        }),
        publicClient.readContract({
          abi: ERC20Abi,
          address: newCoinAddress as `0x${string}`,
          functionName: 'symbol',
        }),
      ])

      const vaultData = {
        coinAddress: newCoinAddress as `0x${string}`,
        coinName: name as string,
        coinSymbol: symbol as string,
        vaultAddress: vaultAddress,
        chainId: chainId,
      }

      setVault(vaultData)
      setVaultCreator(newVaultCreator as `0x${string}`)
      setCoinAddress(newCoinAddress as `0x${string}`)
      setCoinName(name as string)
      setCoinSymbol(symbol as string)
    } catch (error) {
      console.error('Error fetching vault data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFees = async () => {
    if (!vaultAddress || !chainId) return

    try {
      const publicClient = getPublicClient(config, { chainId })

      if (!publicClient) return

      const [vaultFeeOnChain, vaultCreatorFeeOnChain, stableOrderFeeOnChain] =
        await Promise.all([
          publicClient.readContract({
            abi: HodlCoinAbi,
            address: vaultAddress,
            functionName: 'vaultFee',
          }),
          publicClient.readContract({
            abi: HodlCoinAbi,
            address: vaultAddress,
            functionName: 'vaultCreatorFee',
          }),
          publicClient.readContract({
            abi: HodlCoinAbi,
            address: vaultAddress,
            functionName: 'stableOrderFee',
          }),
        ])

      setFees({
        vaultFee: Number(vaultFeeOnChain),
        vaultCreatorFee: Number(vaultCreatorFeeOnChain),
        stableOrderFee: Number(stableOrderFeeOnChain),
      })
    } catch (err) {
      console.error('Error getting fees:', err)
    }
  }

  const getBalances = async () => {
    if (!vaultAddress || !coinAddress || !account.address || !chainId) return

    try {
      const publicClient = getPublicClient(config, { chainId })

      if (!publicClient) return

      const [coinReserveOnChain, coinBalanceOnChain, hodlCoinBalanceOnChain] =
        await Promise.all([
          publicClient.readContract({
            abi: ERC20Abi,
            address: coinAddress,
            functionName: 'balanceOf',
            args: [vaultAddress],
          }),
          publicClient.readContract({
            abi: ERC20Abi,
            address: coinAddress,
            functionName: 'balanceOf',
            args: [account.address],
          }),
          publicClient.readContract({
            abi: ERC20Abi,
            address: vaultAddress,
            functionName: 'balanceOf',
            args: [account.address],
          }),
        ])

      setBalances(prev => ({
        ...prev,
        coinReserve: Number(coinReserveOnChain) / 10 ** 18,
        coinBalance: Number(coinBalanceOnChain) / 10 ** 18,
        hodlCoinBalance: Number(hodlCoinBalanceOnChain) / 10 ** 18,
      }))
    } catch (err) {
      console.error('Error getting balances:', err)
    }
  }

  const getReservesPrices = async () => {
    if (!vaultAddress || !chainId) return

    try {
      const publicClient = getPublicClient(config, { chainId })

      if (!publicClient) return

      const [hodlCoinSupplyOnChain, priceHodlOnChain] = await Promise.all([
        publicClient.readContract({
          abi: ERC20Abi,
          address: vaultAddress,
          functionName: 'totalSupply',
        }),
        publicClient.readContract({
          abi: HodlCoinAbi,
          address: vaultAddress,
          functionName: 'priceHodl',
        }),
      ])

      setBalances(prev => ({
        ...prev,
        hodlCoinSupply: Number(hodlCoinSupplyOnChain) / 10 ** 18,
        priceHodl: Number(priceHodlOnChain) / 100000,
      }))
    } catch (err) {
      console.error('Error getting reserves and prices:', err)
    }
  }

  useEffect(() => {
    if (vaultAddress && chainId) {
      getVaultsData()
    }
  }, [vaultAddress, chainId])

  useEffect(() => {
    if (vaultAddress && coinAddress && chainId) {
      getReservesPrices()
      getFees()
    }
    if (vaultAddress && coinAddress && account.address && chainId) {
      getBalances()
    }
  }, [vaultAddress, coinAddress, account.address, chainId])

  if (isLoading) {
    return (
      <div className='w-full h-screen flex items-center justify-center bg-gray-50 dark:bg-black'>
        <div className='text-xl text-gray-900 dark:text-white'>
          Loading vault data...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='w-full h-screen flex items-center justify-center bg-gray-50 dark:bg-black'>
        <div className='text-xl text-red-600 dark:text-red-400'>{error}</div>
      </div>
    )
  }

  return (
    <div className='w-full pt-14 bg-gray-50 dark:bg-black'>
      <div className='w-full md:px-24 lg:px-24'>
        <div className='container mx-auto px-8 py-6 flex justify-between items-center'>
          <div className='flex items-center space-x-4'>
            <Coins className='h-8 w-8 text-amber-500 dark:text-yellow-400 transition-colors duration-200' />
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200'>
              {coinName} Vault
            </h1>
          </div>
          <div className='flex space-x-4'>
            <div className='bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-md px-5 py-3 text-center transition-colors duration-200'>
              <div className='text-sm text-gray-600 dark:text-gray-400 font-bold transition-colors duration-200'>
                Token Balance
              </div>
              <div className='font-mono text-lg text-amber-500 dark:text-yellow-400 transition-colors duration-200'>
                {balances.coinBalance} {coinSymbol}
              </div>
            </div>
            <div className='bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-md px-5 py-3 text-center transition-colors duration-200'>
              <div className='text-sm text-gray-600 dark:text-gray-400 font-bold transition-colors duration-200'>
                Staked Balance
              </div>
              <div className='font-mono text-lg text-purple-600 dark:text-purple-500 transition-colors duration-200'>
                {balances.hodlCoinBalance} h{coinSymbol}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='w-full px-8'>
        <HeroVault
          vault={vault}
          priceHodl={balances.priceHodl}
          reserve={balances.coinReserve}
          supply={balances.hodlCoinSupply}
        />
        <ActionsVault
          vault={vault}
          getBalances={getBalances}
          priceHodl={balances.priceHodl}
          coinBalance={balances.coinBalance}
          hodlCoinBalance={balances.hodlCoinBalance}
        />
        <VaultInformation
          vault={vault}
          vaultFee={fees.vaultFee}
          vaultCreatorFee={fees.vaultCreatorFee}
          stableOrderFee={fees.stableOrderFee}
          vaultCreator={vaultCreator}
        />
      </div>
    </div>
  )
}
