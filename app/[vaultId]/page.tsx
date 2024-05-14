'use client'

import ActionsVault from '@/components/Vault/Actions'
import HeroVault from '@/components/Vault/HeroVault'
import { ERC20Abi } from '@/utils/contracts/ERC20'
import { vaultsProps } from '@/utils/props'
import { useEffect, useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { readContract } from '@wagmi/core'
import { config } from '@/utils/config'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'

// @ts-ignore
export default function VaultPage({ params: { vaultId } }) {
  const [loading, setLoading] = useState<boolean>(false)
  const [vault, setVault] = useState<vaultsProps | null>(null)
  const [coinContract, setCoinContract] = useState<`0x${string}`>('0x0')

  const [coinBalance, setCoinBalance] = useState<BigInt>(BigInt(0))
  const [hodlCoinBalance, setHodlCoinBalance] = useState<BigInt>(BigInt(0))
  const [coinReserve, setCoinReserve] = useState<number>(0)
  const [hodlCoinSupply, setHodlCoinSupply] = useState<number>(0)
  const [priceHodl, setPriceHodl] = useState<number>(0)
  const [priceUnhodl, setPriceUnhodl] = useState<number>(0)
  const account = useAccount()

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

      setPriceHodl(Number(priceHodlOnChain))

      const priceUnhodldOnChain = (await readContract(config as any, {
        abi: HodlCoinAbi,
        address: vaultId,
        functionName: 'priceUnhodl',
        args: [],
      })) as number

      setPriceUnhodl(Number(priceUnhodldOnChain))

      console.log('coinReserveOnChain', coinReserveOnChain)
      console.log('hodlCoinSupplyOnChain', hodlCoinSupplyOnChain)
      console.log('priceHodlOnChain', priceHodlOnChain)
      console.log('priceUnhodldOnChain', priceUnhodldOnChain)
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
      setCoinBalance(BigInt(coinBalanceOnChain) / BigInt(10 ** 18))

      const hodlCoinBalanceOnChain = (await readContract(config as any, {
        abi: ERC20Abi,
        address: vaultId,
        functionName: 'balanceOf',
        args: [account.address],
      })) as number

      setHodlCoinBalance(BigInt(hodlCoinBalanceOnChain) / BigInt(10 ** 18))
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

  return (
    <div className='w-full pt-32'>
      <div className='w-full md:px-24 lg:px-24 mb-12'>
        <HeroVault vault={vault} />
        <br />
        <p>
          Price Hodl: {priceHodl.toFixed(6)} {vault?.coinName}/ {vault?.name}
        </p>
        <p>
          Price Unhodl: {priceUnhodl.toFixed(6)} {vault?.coinName} /{' '}
          {vault?.name}{' '}
        </p>

        <p>
          Reserve: {coinReserve.toFixed(6)} {vault?.coinName}
        </p>
        <p>
          Supply: {hodlCoinSupply.toFixed(6)} {vault?.name}
        </p>

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
