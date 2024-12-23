'use client'

import { vaultsProps } from '@/utils/props'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { StylishButton } from '../StylishButton'
import { useAccount } from 'wagmi'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { readContract, writeContract } from '@wagmi/core'
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
  const [unholdAmount, setUnholdAmount] = useState<number>(0)
  const account = useAccount()

  const [feesAmount, setFeesAmount] = useState({
    vaultFeeAmount: 0,
    vaultCreatorFeeAmount: 0,
    stableOrderFeeAmount: 0,
  })

  const isMaxAmount = unholdAmount >= hodlCoinBalance

  const getFees = async () => {
    try {
      const amountInWei = BigInt(Math.floor(unholdAmount * 10 ** 18))

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

    if (unholdAmount === null || unholdAmount <= 0) {
      toast({
        title: 'Amount Invalid',
        description: 'Please input a valid amount',
      })
      return false
    }

    if (unholdAmount > hodlCoinBalance) {
      setUnholdAmount(hodlCoinBalance)
      return false
    }

    return true
  }

  const formatAmount = (amount: number) => {
    try {
      return BigInt(Math.floor(amount * 10 ** 18))
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
    const amountToUnhold = isMaxAmount ? hodlCoinBalance : unholdAmount
    setUnholdAmount(hodlCoinBalance)

    if (!validateInputs()) {
      return
    }

    try {
      setLoadingUnhold(true)

      const formattedAmount = formatAmount(amountToUnhold)
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

      setUnholdAmount(0)
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
    setUnholdAmount(hodlCoinBalance)
  }

  useEffect(() => {
    if (unholdAmount > 0) {
      getFees()
    }
  }, [unholdAmount])

  return (
    <Card className='bg-[#121212] border-gray-900'>
      <CardHeader>
        <CardTitle className='text-yellow-500'>UnStake Tokens</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='relative'>
          <Input
            type='number'
            placeholder='Amount'
            className='w-full bg-black pr-16'
            value={unholdAmount !== null ? unholdAmount.toString() : ''}
            onChange={e => {
              const value = parseFloat(e.target.value)
              setUnholdAmount(isNaN(value) ? 0 : value)
            }}
            min={0}
            max={hodlCoinBalance}
          />
          <Button
            variant='ghost'
            className='absolute right-2 top-1/2 -translate-y-1/2 text-xs text-yellow-500 hover:text-yellow-600 px-2 py-1'
            onClick={handleMaxClick}
          >
            MAX
          </Button>
        </div>
        <div className='font-mono flex flex-row space-x-2 px-1 pb-4 pt-3 text-sm text-green-400'>
          {unholdAmount > 0 ? (
            <p>
              {unholdAmount * priceHodl -
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
          <Button className='w-full' disabled>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Please wait
          </Button>
        ) : (
          <StylishButton buttonCall={unholdAction}>
            {isMaxAmount ? 'Unstake All' : 'Unstake'}
          </StylishButton>
        )}
      </CardContent>
    </Card>
  )
}
