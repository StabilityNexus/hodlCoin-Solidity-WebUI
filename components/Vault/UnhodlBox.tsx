'use client'

import { vaultsProps } from '@/utils/props'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, TrendingDown, AlertTriangle, Coins, DollarSign } from 'lucide-react'
import { ERC20Abi } from '@/utils/contracts/ERC20'
import { useAccount } from 'wagmi'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { readContract, writeContract, getPublicClient } from '@wagmi/core'
import { config } from '@/utils/config'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { parseUnits } from 'viem'

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
  const [unholdAmount, setUnholdAmount] = useState<string>('')
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
        vaultCreatorFeeAmount: Number(amount[2]) / 10 ** 18,
        stableOrderFeeAmount: Number(amount[1]) / 10 ** 18,
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
      const decimals = vault?.decimals ?? 18
      return parseUnits(amountStr, decimals)
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

  const totalFees = feesAmount.vaultFeeAmount + feesAmount.vaultCreatorFeeAmount + feesAmount.stableOrderFeeAmount
  const expectedReceive = unholdAmount && parseFloat(unholdAmount) > 0 
    ? parseFloat(unholdAmount) * priceHodl - totalFees 
    : 0

  return (
    <Card className='bg-background/50 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/5 hover:border-primary/30 transition-all duration-300'>
      <CardHeader>
        <CardTitle className='font-extrabold tracking-tight text-gradient text-xl flex items-center gap-3'>
          <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
            <TrendingDown className="h-5 w-5 text-yellow-500" />
          </div>
          Unstake Tokens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">


        {/* Input Section */}
        <div className="space-y-3">
          <div className='text-sm font-semibold text-foreground flex items-center gap-2'>
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            Amount to Unstake
          </div>
          <div className='relative'>
            <Input
              type='text'
              placeholder='0.0'
              className='w-full bg-background/50 backdrop-blur-sm border-primary/30 focus:border-primary/60 
                transition-all duration-300 hover:border-primary/50 text-foreground pr-20 text-lg font-mono'
              value={unholdAmount}
              onChange={e => {
                const value = e.target.value
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setUnholdAmount(value)
                }
              }}
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-2">
              <Button
                variant='ghost'
                size="sm"
                className='text-xs text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10 px-2 py-1 h-auto'
                onClick={handleMaxClick}
              >
                MAX
              </Button>
              <span className="text-sm text-muted-foreground font-mono">
                {vault?.hodlCoinSymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Fee Breakdown */}
        {unholdAmount && parseFloat(unholdAmount) > 0 && (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-semibold text-foreground">Unstaking Fees</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vault Fee:</span>
                  <span className="font-mono text-yellow-600">{feesAmount.vaultFeeAmount.toFixed(6)} {vault?.coinSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creator Fee:</span>
                  <span className="font-mono text-blue-600">{feesAmount.vaultCreatorFeeAmount.toFixed(6)} {vault?.coinSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protocol Fee:</span>
                  <span className="font-mono text-purple-600">{feesAmount.stableOrderFeeAmount.toFixed(6)} {vault?.coinSymbol}</span>
                </div>
                <div className="border-t border-muted-foreground/20 pt-2 flex justify-between font-semibold">
                  <span className="text-foreground">Total Fees:</span>
                  <span className="font-mono text-red-500">{totalFees.toFixed(6)} {vault?.coinSymbol}</span>
                </div>
              </div>
            </div>

            {/* Expected Output */}
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">You will receive</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-green-500">
                    {expectedReceive.toFixed(6)}
                  </span>
                  <span className="text-sm text-muted-foreground">{vault?.coinSymbol}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {loadingUnhold ? (
          <Button
            className='w-full bg-muted hover:bg-muted text-muted-foreground cursor-not-allowed'
            disabled
          >
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Unstaking...
          </Button>
        ) : (
          <Button
            onClick={unholdAction}
            disabled={!unholdAmount || parseFloat(unholdAmount) <= 0}
            className='w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-500 
              transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 
              text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none'
          >
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              {isMaxAmount && unholdAmount !== '' ? 'Unstake All' : 'Unstake Tokens'}
            </div>
          </Button>
        )}

        {/* Warning Text */}
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Unstaking incurs fees that benefit remaining stakers and the vault creator. 
              Consider the timing of your unstaking to minimize fees.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
