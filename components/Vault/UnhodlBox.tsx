'use client'

import { vaultsProps } from '@/utils/props'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { StylishButton } from '../StylishButton'
import { ERC20Abi } from '@/utils/contracts/ERC20'
import { useAccount } from 'wagmi'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { readContract, writeContract, getPublicClient } from '@wagmi/core'
import { config } from '@/utils/config'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export default function UnholdBox({
  priceHodl,
  vault,
  hodlCoinBalance,
  getBalances,
}: {
  priceHodl: any
  vault: vaultsProps | null
  hodlCoinBalance: number
  getBalances: Function
}) {
  const { toast } = useToast()
  const [loadingUnhold, setLoadingUnhold] = useState<boolean>(false)
  const [unholdAmount, setUnholdAmount] = useState<string>('') // Changed to string
  const account = useAccount()

  const [feesAmount, setFeesAmount] = useState({
    vaultFeeAmount: 0,
    vaultCreatorFeeAmount: 0,
    stableOrderFeeAmount: 0,
  })

  const isMaxAmount = parseFloat(unholdAmount) >= hodlCoinBalance

  const getFees = async () => {
    try {
      const amountValue = parseFloat(unholdAmount) || 0
      const amountInWei = BigInt(Math.floor(amountValue * 10 ** 18))

      const amount = (await readContract(config as any, {
        abi: HodlCoinAbi,
        address: vault?.vaultAddress as `0x${string}`,
        functionName: 'feeAmounts',
        args: [amountInWei],
      })) as [bigint, bigint, bigint]

      setFeesAmount({
        vaultFeeAmount: Number(amount[0]) / 10 ** 18,
        vaultCreatorFeeAmount: Number(amount[1]) / 10 ** 18,
        stableOrderFeeAmount: Number(amount[2]) / 10 ** 18,
      })
    } catch (err) {
      console.error('Error getting fees amount:', err)
    }
  }

  const validateInputs = () => {
    if (!vault?.vaultAddress) {
      toast({
        title: 'Error',
        description: 'Vault address not properly initialized',
      })
      return false
    }

    if (!account.address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
      })
      return false
    }

    const amount = parseFloat(unholdAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Amount Invalid',
        description: 'Please input a valid amount',
      })
      return false
    }

    if (amount > hodlCoinBalance) {
      setUnholdAmount(hodlCoinBalance.toString())
      return false
    }

    return true
  }

  const formatAmount = (amountStr: string) => {
    try {
      const amount = parseFloat(amountStr)
      const decimals = vault?.decimals ?? 18;
      return BigInt(Math.floor(amount * 10 ** decimals))
    } catch (error) {
      console.error('Error formatting amount:', error)
      toast({
        title: 'Error',
        description: 'Error formatting amount',
      })
      return null
    }
  }

  const unholdAction = async () => {
    const amountToUnhold = isMaxAmount
      ? hodlCoinBalance
      : parseFloat(unholdAmount)
    setUnholdAmount(hodlCoinBalance.toString())

    if (!validateInputs()) {
      return
    }

    try {
      setLoadingUnhold(true)

      const formattedAmount = formatAmount(amountToUnhold.toString())
      if (!formattedAmount) {
        return
      }

      const tx = await writeContract(config as any, {
        abi: HodlCoinAbi,
        address: vault?.vaultAddress as `0x${string}`,
        functionName: 'unhodl',
        args: [formattedAmount],
        account: account.address as `0x${string}`,
      })

      await getBalances()

      toast({
        title: 'Unhold Success',
        description: 'Your tokens have been successfully unstaked',
      })

      setUnholdAmount('')
    } catch (error) {
      console.error('Unhold error:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to unhold tokens',
      })
    } finally {
      setLoadingUnhold(false)
    }
  }

  const handleMaxClick = () => {
    setUnholdAmount(hodlCoinBalance.toString())
  }

  useEffect(() => {
    if (unholdAmount && parseFloat(unholdAmount) > 0) {
      getFees()
    }
  }, [unholdAmount])

  return (
    <Card className='bg-white dark:bg-[#121212] border-gray-200 dark:border-gray-900 transition-colors duration-200'>
      <CardHeader>
        <CardTitle className='text-amber-600 dark:text-yellow-300 transition-colors duration-200'>
          UnStake Tokens
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='relative'>
          <Input
            type='text' // Changed from 'number' to 'text'
            placeholder='Amount'
            className='w-full bg-gray-50 dark:bg-black border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white pr-16 transition-colors duration-200'
            value={unholdAmount}
            onChange={e => {
              const value = e.target.value
              // Only allow numbers and decimal points
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setUnholdAmount(value)
              }
            }}
          />
          <Button
            variant='ghost'
            className='absolute right-2 top-1/2 -translate-y-1/2 text-xs text-amber-600 hover:text-amber-700 dark:text-yellow-500 dark:hover:text-yellow-600 px-2 py-1 transition-colors duration-200'
            onClick={handleMaxClick}
          >
            MAX
          </Button>
        </div>
        <div className='font-mono flex flex-row space-x-2 px-1 pb-4 pt-3 text-sm text-purple-800 dark:text-purple-500 transition-colors duration-200'>
          {unholdAmount && parseFloat(unholdAmount) > 0 ? (
            <p>
              {parseFloat(unholdAmount) * priceHodl -
                (feesAmount.vaultFeeAmount +
                  feesAmount.vaultCreatorFeeAmount +
                  feesAmount.stableOrderFeeAmount)}
            </p>
          ) : (
            <p>0</p>
          )}
          <p> {vault?.coinSymbol}</p>
        </div>
        {loadingUnhold ? (
          <Button
            className='w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200'
            disabled
          >
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Please wait
          </Button>
        ) : (
          <StylishButton buttonCall={unholdAction}>
            {isMaxAmount && unholdAmount !== '' ? 'Unstake All' : 'Unstake'}
          </StylishButton>
        )}
      </CardContent>
    </Card>
  )
}
