'use client'

import { vaultsProps } from '@/utils/props'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { StylishButton } from '../StylishButton'
import { useAccount } from 'wagmi'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { writeContract } from '@wagmi/core'
import { config } from '@/utils/config'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export default function UnholdBox({
  id,
  vault,
  hodlCoinBalance,
  getBalances,
}: {
  id: any
  vault: vaultsProps | null
  hodlCoinBalance: number
  getBalances: Function
}) {
  const { toast } = useToast()
  const [loadingUnhold, setLoadingUnhold] = useState<boolean>(false)
  const [unholdAmount, setUnholdAmount] = useState<number | null>(null)
  const account = useAccount()

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
      toast({
        title: 'Insufficient Balance',
        description: 'You do not have enough staked tokens to unhold',
      })
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
    if (!validateInputs()) {
      return
    }

    try {
      setLoadingUnhold(true)

      const formattedAmount = formatAmount(unholdAmount!)
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

      setUnholdAmount(null) // Reset input after successful unhold
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

  return (
    <Card className='bg-[#121212] border-gray-900'>
      <CardHeader>
        <CardTitle className='text-yellow-500'>Unhold Tokens</CardTitle>
      </CardHeader>
      <CardContent className='space-y-8'>
        <Input
          type='number'
          placeholder='Amount'
          className='w-full bg-black'
          value={unholdAmount !== null ? unholdAmount.toString() : ''}
          onChange={e => {
            const value = parseFloat(e.target.value)
            setUnholdAmount(isNaN(value) ? null : value)
          }}
          min={0}
          max={hodlCoinBalance}
        />
        {loadingUnhold ? (
          <Button className='w-full' disabled>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Please wait
          </Button>
        ) : (
          <StylishButton
            buttonCall={unholdAction}
          >
            Unstake
          </StylishButton>
        )}
      </CardContent>
    </Card>
  )
}