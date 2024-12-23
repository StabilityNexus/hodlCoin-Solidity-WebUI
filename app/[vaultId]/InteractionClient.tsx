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
import { useSearchParams } from 'next/navigation'


export default function InteractionClient() {

  const searchParams = useSearchParams()
  let chainId = searchParams.get('chainId')
  let vaultAddress = searchParams.get('vault')

  const [vaultCreator, setVaultCreator] = useState<`0x${string}`>('0x0')
  const [coinAddress, setCoinAddress] = useState<`0x${string}`>('0x0')
  const [coinName, setCoinName] = useState<string>('')
  const [coinSymbol, setCoinSymbol] = useState<string>('')

  const [vault, setVault] = useState<vaultsProps>({
    coinAddress: '0x0' as `0x${string}`,
    coinName: '',
    coinSymbol: '',
    vaultAddress: '0x0' as `0x${string}`,
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

  const getVaultsData = async () => {
    try {
      if (!vaultAddress) {
        console.error('No vault address provided')
        return
      }
  
      const newCoinAddress = (await readContract(config as any, {
        abi: HodlCoinAbi,
        address: vaultAddress as `0x${string}`,
        functionName: 'coin',
        args: [],
      })) as `0x${string}`

      const newVaultCreator = (await readContract(config as any, {
        abi: HodlCoinAbi,
        address: vaultAddress as `0x${string}`,
        functionName: 'vaultCreator',
        args: [],
      })) as `0x${string}`

      const [name, symbol] = await Promise.all([
        readContract(config as any, {
          abi: ERC20Abi,
          address: newCoinAddress,
          functionName: 'name',
          args: [],
        }),
        readContract(config as any, {
          abi: ERC20Abi,
          address: newCoinAddress,
          functionName: 'symbol',
          args: [],
        }),
      ])

      setVault({
        coinAddress: newCoinAddress,
        coinName: name as string,
        coinSymbol: symbol as string,
        vaultAddress: vaultAddress as `0x${string}`,
      })

      setVaultCreator(newVaultCreator)
      setCoinAddress(newCoinAddress)
      setCoinName(name as string)
      setCoinSymbol(symbol as string)

    } catch (error) {
      console.error('Error fetching vault data:', error)
    }
  }

  
  const getFees = async () => {
    try {
      const [vaultFeeOnChain, vaultCreatorFeeOnChain, stableOrderFeeOnChain] =
      await Promise.all([
        readContract(config as any, {
          abi: HodlCoinAbi,
          address: vaultAddress as `0x${string}`,
          functionName: 'vaultFee',
          args: [],
        }),
        readContract(config as any, {
          abi: HodlCoinAbi,
          address: vaultAddress as `0x${string}`,
          functionName: 'vaultCreatorFee',
          args: [],
        }),
        readContract(config as any, {
          abi: HodlCoinAbi,
          address: vaultAddress as `0x${string}`,
          functionName: 'stableOrderFee',
          args: [],
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
    try {
      const [coinReserveOnChain, coinBalanceOnChain, hodlCoinBalanceOnChain] =
        await Promise.all([
          readContract(config as any, {
            abi: ERC20Abi,
            address: coinAddress as `0x${string}`,
            functionName: 'balanceOf',
            args: [vaultAddress],
          }),
          readContract(config as any, {
            abi: ERC20Abi,
            address: coinAddress as `0x${string}`,
            functionName: 'balanceOf',
            args: [account.address],
          }),
          readContract(config as any, {
            abi: ERC20Abi,
            address: vaultAddress as `0x${string}`,
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
    try {
      const [hodlCoinSupplyOnChain, priceHodlOnChain] =
      await Promise.all([
        readContract(config as any, {
          abi: ERC20Abi,
          address: vaultAddress as `0x${string}`,
          functionName: 'totalSupply',
          args: [],
        }),
        readContract(config as any, {
          abi: HodlCoinAbi,
          address: vaultAddress as `0x${string}`,
          functionName: 'priceHodl',
          args: [],
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
    if (vaultAddress) {
      getVaultsData()
    }
  }, [vaultAddress])
  
  useEffect(() => {
    if (vaultAddress && coinAddress) {
      getReservesPrices()
      getFees()
    }
      if (vaultAddress && coinAddress && account.address) {
        getBalances()
      }
  }, [vaultAddress, coinAddress, account.address])
  
  return (
    <div className='w-full pt-14'>
      <div className='w-full md:px-24 lg:px-24'>
        <div className='container mx-auto px-8 py-6 flex justify-between items-center'>
          <div className='flex items-center space-x-4'>
            <Coins className='h-8 w-8 text-yellow-400' />
            <h1 className='text-2xl font-bold text-white'>{coinName} Vault</h1>
          </div>
          <div className='flex space-x-4'>
            <div className='bg-[#141414] border border-gray-800 rounded-md px-5 py-3 text-center'>
              <div className='text-sm text-gray-400'>Token Balance</div>
              <div className='font-mono text-lg text-yellow-400'>
                {balances.coinBalance} {coinSymbol}
              </div>
            </div>
            <div className='bg-[#141414] border border-gray-800 rounded-md px-5 py-3 text-center'>
              <div className='text-sm text-gray-400'>Staked Balance</div>
              <div className='font-mono text-lg text-green-400'>
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