'use client'

import { Coins } from 'lucide-react'
import ActionsVault from '@/components/Vault/Actions'
import HeroVault from '@/components/Vault/HeroVault'
import VaultInformation from '@/components/Vault/VaultInformation'
import { ERC20Abi } from '@/utils/contracts/ERC20'
import { vaultsProps } from '@/utils/props'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { readContract } from '@wagmi/core'
import { config } from '@/utils/config'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { HodlCoinFactoryAbi } from '@/utils/contracts/HodlCoinFactory'
import { HodlCoinVaultFactories } from '@/utils/addresses'
import { init } from 'next/dist/compiled/webpack/webpack'

interface InteractionClientProps {
  initialVaultId: {
    initialVaultId: number
  }
}
export default function InteractionClient({
  initialVaultId,
}: InteractionClientProps) {
  const [uniqueId, setUniqueId] = useState<number>(5)
  const [loading, setLoading] = useState<boolean>(false)
  const [vaultData, setVaultData] = useState({
    vaultAddress: '0x0' as `0x${string}`,
    coinContract: '0x0' as `0x${string}`,
    vault: null as vaultsProps | null,
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

  const account = useAccount()
  
  // Initial setup - get vault data
  useEffect(() => {
    setUniqueId(initialVaultId.initialVaultId)
    getVaultsData()
  }, [initialVaultId.initialVaultId])

  const getVaultsData = async () => {
    try {
      setLoading(true)
      const chainId = config.state.chainId

      const vaultDetails = (await readContract(config as any, {
        abi: HodlCoinFactoryAbi,
        address: HodlCoinVaultFactories[chainId],
        functionName: 'getVaultDetails',
        args: [uniqueId],
      })) as vaultsProps

      const newVaultData = {
        vaultAddress: vaultDetails.vaultAddress,
        coinContract: vaultDetails.coinAddress,
        vault: {
          vaultAddress: vaultDetails.vaultAddress,
          vaultName: vaultDetails.vaultName,
          coinName: vaultDetails.coinName,
          coinAddress: vaultDetails.coinAddress,
          coinSymbol: vaultDetails.coinSymbol,
        },
      }

      setVaultData(newVaultData)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  // Get fees once vault address is available
  useEffect(() => {
    if (vaultData.vaultAddress !== '0x0') {
      getFees()
    }
  }, [vaultData.vaultAddress])

  const getFees = async () => {
    try {
      const [vaultFeeOnChain, vaultCreatorFeeOnChain, stableOrderFeeOnChain] =
        await Promise.all([
          readContract(config as any, {
            abi: HodlCoinAbi,
            address: vaultData.vaultAddress,
            functionName: 'vaultFee',
            args: [],
          }),
          readContract(config as any, {
            abi: HodlCoinAbi,
            address: vaultData.vaultAddress,
            functionName: 'vaultCreatorFee',
            args: [],
          }),
          readContract(config as any, {
            abi: HodlCoinAbi,
            address: vaultData.vaultAddress,
            functionName: 'stableOrderFee',
            args: [],
          }),
        ])

      setFees({
        vaultFee: Number(vaultFeeOnChain) / 1000,
        vaultCreatorFee: Number(vaultCreatorFeeOnChain) / 1000,
        stableOrderFee: Number(stableOrderFeeOnChain) / 1000,
      })
    } catch (err) {
      console.error('Error getting fees:', err)
    }
  }

  // Get balances and reserves once vault and coin addresses are available
  useEffect(() => {
    if (
      vaultData.vaultAddress !== '0x0' &&
      vaultData.coinContract !== '0x0' &&
      account.address
    ) {
      getBalances()
      getReservesPrices()
    }
  }, [vaultData.vaultAddress, vaultData.coinContract, account.address])

  const getBalances = async () => {
    try {
      const [coinBalanceOnChain, hodlCoinBalanceOnChain] = await Promise.all([
        readContract(config as any, {
          abi: ERC20Abi,
          address: vaultData.coinContract,
          functionName: 'balanceOf',
          args: [account.address],
        }),
        readContract(config as any, {
          abi: ERC20Abi,
          address: vaultData.vaultAddress,
          functionName: 'balanceOf',
          args: [account.address],
        }),
      ])

      setBalances(prev => ({
        ...prev,
        coinBalance: Number(coinBalanceOnChain) / 10 ** 18,
        hodlCoinBalance: Number(hodlCoinBalanceOnChain) / 10 ** 18,
      }))
    } catch (err) {
      console.error('Error getting balances:', err)
    }
  }

  const getReservesPrices = async () => {
    try {
      const [coinReserveOnChain, hodlCoinSupplyOnChain, priceHodlOnChain] =
        await Promise.all([
          readContract(config as any, {
            abi: ERC20Abi,
            address: vaultData.coinContract,
            functionName: 'balanceOf',
            args: [vaultData.vaultAddress],
          }),
          readContract(config as any, {
            abi: ERC20Abi,
            address: vaultData.vaultAddress,
            functionName: 'totalSupply',
            args: [],
          }),
          readContract(config as any, {
            abi: HodlCoinAbi,
            address: vaultData.vaultAddress,
            functionName: 'priceHodl',
            args: [],
          }),
        ])

      setBalances(prev => ({
        ...prev,
        coinReserve: Number(coinReserveOnChain) / 10 ** 18,
        hodlCoinSupply: Number(hodlCoinSupplyOnChain) / 10 ** 18,
        priceHodl: Number(priceHodlOnChain) / 100000,
      }))
    } catch (err) {
      console.error('Error getting reserves and prices:', err)
    }
  }

  return (
    <div className='w-full pt-14'>
      <div className='w-full md:px-24 lg:px-24'>
        <div className='container mx-auto px-8 py-6 flex justify-between items-center'>
          <div className='flex items-center space-x-4'>
            <Coins className='h-8 w-8 text-yellow-400' />
            <h1 className='text-2xl font-bold text-white'>
              {vaultData.vault?.coinName} Vault
            </h1>
          </div>
          <div className='bg-[#141414] border-gray-900 rounded-md px-5 py-3 text-centre'>
            <div className='text-m text-gray-400'>Balance</div>
            <div className='font-mono text-lg text-yellow-400'>
              {balances.coinBalance} {vaultData.vault?.coinSymbol}
            </div>
          </div>
        </div>
      </div>

      <div className='w-full px-8'>
        <HeroVault
          vault={vaultData.vault}
          priceHodl={balances.priceHodl}
          reserve={balances.coinReserve}
          supply={balances.hodlCoinSupply}
          vaultFee={fees.vaultFee}
          vaultCreatorFee={fees.vaultCreatorFee}
          stableOrderFee={fees.stableOrderFee}
        />
        <ActionsVault
          getBalances={getBalances}
          coinBalance={balances.coinBalance}
          hodlCoinBalance={balances.hodlCoinBalance}
          vault={vaultData.vault}
        />
        <VaultInformation
          vault={vaultData.vault}
          priceHodl={balances.priceHodl}
          reserve={balances.coinReserve}
          supply={balances.hodlCoinSupply}
          vaultFee={fees.vaultFee}
          vaultCreatorFee={fees.vaultCreatorFee}
          stableOrderFee={fees.stableOrderFee}
        />
      </div>
    </div>
  )
}
