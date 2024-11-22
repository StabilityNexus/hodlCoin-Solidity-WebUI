'use client'

import ActionsVault from '@/components/Vault/Actions'
import HeroVault from '@/components/Vault/HeroVault'
import { ERC20Abi } from '@/utils/contracts/ERC20'
import { vaultsProps } from '@/utils/props'
import { use, useEffect, useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { readContract } from '@wagmi/core'
import { config } from '@/utils/config'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'

// @ts-ignore
export default function InteractionClient(initialVaultId ) {

  const [vaultId, setVaultId] = useState<any>(initialVaultId)

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash) {
      setVaultId(hash)
    }
  }, [])

  const [loading, setLoading] = useState<boolean>(false)
  const [vault, setVault] = useState<vaultsProps | null>(null)
  const [coinContract, setCoinContract] = useState<`0x${string}`>('0x0')

  const [coinBalance, setCoinBalance] = useState<number>(0)
  const [hodlCoinBalance, setHodlCoinBalance] = useState<number>(0)
  const [coinReserve, setCoinReserve] = useState<number>(0)
  const [hodlCoinSupply, setHodlCoinSupply] = useState<number>(0)
  const [priceHodl, setPriceHodl] = useState<number>(0)

  const [devFee, setDevFee] = useState<number>(0)
  const [vaultCreatorFee, setVaultCreatorFee] = useState<number>(0)
  const [reserveFee, setReserveFee] = useState<number>(0)

  const account = useAccount()

  async function getFees() {
    try {
      const devFeeOnChain = (await readContract(config as any, {
        abi: HodlCoinAbi,
        address: vaultId,
        functionName: 'devFee',
        args: [],
      })) as number
      setDevFee(Number(devFeeOnChain) / 1000)

      console.log('devFee', Number(devFeeOnChain))

      const vaultCreatorFeeOnChain = (await readContract(config as any, {
        abi: HodlCoinAbi,
        address: vaultId,
        functionName: 'vaultCreatorFee',
        args: [],
      })) as number
      setVaultCreatorFee(Number(vaultCreatorFeeOnChain) / 1000)

      const reserveFeeOnChain = (await readContract(config as any, {
        abi: HodlCoinAbi,
        address: vaultId,
        functionName: 'reserveFee',
        args: [],
      })) as number

      setReserveFee(Number(reserveFeeOnChain) / 1000)
    } catch (err) {
      console.error(err)
    }
  }

  async function getReservesPrices() {
    try {
      const coinReserveOnChain = (await readContract(config as any, {
        abi: ERC20Abi,
        address: coinContract,
        functionName: 'balanceOf',
        args: [vaultId],
      })) as number
      setCoinReserve(Number(coinReserveOnChain) / 10 ** 18)

      const hodlCoinSupplyOnChain = (await readContract(config as any, {
        abi: ERC20Abi,
        address: vaultId,
        functionName: 'totalSupply',
        args: [],
      })) as number
      setHodlCoinSupply(Number(hodlCoinSupplyOnChain) / 10 ** 18)

      const priceHodlOnChain = (await readContract(config as any, {
        abi: HodlCoinAbi,
        address: vaultId,
        functionName: 'priceHodl',
        args: [],
      })) as number

      setPriceHodl(Number(priceHodlOnChain) / 100000)
    } catch (err) {
      console.error(err)
    }
  }

  async function getBalances() {
    try {
      if (coinContract == '0x0') return
      const coinBalanceOnChain = (await readContract(config as any, {
        abi: ERC20Abi,
        address: coinContract,
        functionName: 'balanceOf',
        args: [account.address],
      })) as number

      setCoinBalance(Number(coinBalanceOnChain) / 10 ** 18)

      const hodlCoinBalanceOnChain = (await readContract(config as any, {
        abi: ERC20Abi,
        address: vaultId,
        functionName: 'balanceOf',
        args: [account.address],
      })) as number

      setHodlCoinBalance(Number(hodlCoinBalanceOnChain) / 10 ** 18)
    } catch (err) {
      console.error(err)
    }
  }

  const getVaultsData = async () => {
    try {
      setLoading(true)

      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }

      const url = process.env.NEXT_PUBLIC_API_URL + '/vault/' + vaultId
      const response = await fetch(url, options)
      const data = await response.json()

      setCoinContract(data.vault.coin_contract)
      const objVault = {
        id: data.vault.address,
        chainId: data.vault.id,
        name: data.vault.name,
        avatar: '/images/avatar1.jpeg',
        address: data.vault.address,
        coinAddress: data.vault.coin_contract,
        coinName: data.vault.coin_name,
      }
      setVault({ ...objVault })

      setCoinContract(data.vault.coin_contract)
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getReservesPrices()
  }, [coinContract, account.address])

  useEffect(() => {
    getBalances()
  }, [coinContract, account.address])

  useEffect(() => {
    getVaultsData()
  }, [account.address])

  useEffect(() => {
    getFees()
  }, [account.address])

  return (
    <div className='w-full pt-32'>
      <div className='w-full md:px-24 lg:px-24 mb-12'>
        <HeroVault
          vault={vault}
          priceHodl={priceHodl}
          reserve={coinReserve}
          supply={hodlCoinSupply}
          devFee={devFee}
          vaultCreatorFee={vaultCreatorFee}
          reserveFee={reserveFee}
        />
        <ActionsVault
          getBalances={getBalances}
          coinBalance={coinBalance}
          hodlCoinBalance={hodlCoinBalance}
          vault={vault}
        />
      </div>
    </div>
  )
}