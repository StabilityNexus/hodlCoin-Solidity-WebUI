'use client'

import { vaultsProps } from '@/utils/props'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { StylishButton } from '../StylishButton'
import { writeContract } from '@wagmi/core'
import { config } from '@/utils/config'
import { ERC20Abi } from '@/utils/contracts/ERC20'
import { useAccount } from 'wagmi'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export default function HodlBox({
  id,
  vault,
  coinBalance,
  getBalances,
}: {
  id: any
  vault: vaultsProps | null
  coinBalance: number
  getBalances: Function
}) {
  const { toast } = useToast()
  const [loadingHold, setLoadingHold] = useState<boolean>(false)
  const [hodlAmount, setHodlAmount] = useState<number | null>(null)
  const [coinApproved, setCoinApproved] = useState<boolean>(false)

  const account = useAccount()

  const validateInputs = () => {
    if (!vault?.vaultAddress || !vault?.coinAddress) {
      toast({
        title: 'Error',
        description: 'Vault addresses not properly initialized',
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

    if (hodlAmount === null || hodlAmount <= 0) {
      toast({
        title: 'Amount Invalid',
        description: 'Please input a valid amount',
      })
      return false
    }

    if (hodlAmount > coinBalance) {
      console.log(coinBalance);
      toast({
        title: 'Insufficient Balance',
        description: 'You do not have enough tokens',
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

  const hodlAction = async () => {
    try {
      setLoadingHold(true)

      if (!validateInputs()) {
        setLoadingHold(false)
        return
      }

      const formattedAmount = formatAmount(hodlAmount!)
      if (!formattedAmount) {
        setLoadingHold(false)
        return
      }

      if (!coinApproved) {
        try {
          const tx = await writeContract(config as any, {
            abi: ERC20Abi,
            address: vault!.coinAddress as `0x${string}`,
            functionName: 'approve',
            args: [vault!.vaultAddress, formattedAmount],
            account: account.address as `0x${string}`,
          })

          setCoinApproved(true)
          toast({
            title: 'Approval Success',
            description: 'You have successfully approved your tokens',
          })
        } catch (error) {
          console.error('Approval error:', error)
          toast({
            title: 'Approval Failed',
            description:
              error instanceof Error ? error.message : 'Error approving tokens',
          })
          setLoadingHold(false)
          return
        }
      } else {
        try {
          const tx = await writeContract(config as any, {
            abi: HodlCoinAbi,
            address: vault!.vaultAddress as `0x${string}`,
            functionName: 'hodl',
            args: [account.address as `0x${string}`, formattedAmount],
            account: account.address as `0x${string}`,
          })

          await getBalances()
          toast({
            title: 'Hodl Success',
            description: 'Your hodl has been successfully completed',
          })
          setCoinApproved(false) // Reset approval state after successful hodl
        } catch (error) {
          console.error('Hodl error:', error)
          toast({
            title: 'Hodl Failed',
            description:
              error instanceof Error ? error.message : 'Error completing hodl',
          })
        }
      }
    } catch (error) {
      console.error('Transaction error:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      })
    } finally {
      setLoadingHold(false)
    }
  }

  return (
    <Card className='bg-[#121212] border-gray-900'>
      <CardHeader>
        <CardTitle className='text-yellow-500'>HODL Tokens</CardTitle>
      </CardHeader>
      <CardContent className='space-y-8'>
        <Input
          type='number'
          placeholder='Amount'
          className='w-full bg-black'
          value={hodlAmount !== null ? hodlAmount.toString() : ''}
          onChange={e => {
            const value = parseFloat(e.target.value)
            setHodlAmount(isNaN(value) ? null : value)
          }}
        />
        {loadingHold ? (
          <Button className='w-full' disabled>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Please wait
          </Button>
        ) : (
          <StylishButton buttonCall={hodlAction}>
            {coinApproved ? 'Stake' : 'Approve Staking'}
          </StylishButton>
        )}
      </CardContent>
    </Card>
  )
}
