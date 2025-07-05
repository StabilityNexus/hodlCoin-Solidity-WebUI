'use client'

import { vaultsProps } from '@/utils/props'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, TrendingUp, Coins } from 'lucide-react'
import { writeContract, getPublicClient } from '@wagmi/core'
import { config } from '@/utils/config'
import { ERC20Abi } from '@/utils/contracts/ERC20'
import { useAccount } from 'wagmi'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { parseUnits } from 'viem'

export default function HodlBox({
  priceHodl,
  vault,
  coinBalance,
  getBalances,
}: {
  priceHodl: any
  vault: vaultsProps | null
  coinBalance: number
  getBalances: Function
}) {
  const { toast } = useToast()
  const [loadingHold, setLoadingHold] = useState<boolean>(false)
  const [hodlAmount, setHodlAmount] = useState<string>('')
  const [currentStep, setCurrentStep] = useState<'approve' | 'stake' | null>(null)
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

    const amount = parseFloat(hodlAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Amount Invalid',
        description: 'Please input a valid amount',
      })
      return false
    }

    if (amount > coinBalance) {
      console.log(coinBalance)
      toast({
        title: 'Insufficient Balance',
        description: 'You do not have enough tokens',
      })
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

  const hodlAction = async () => {
    try {
      setLoadingHold(true)
      setCurrentStep('approve')

      if (!validateInputs()) {
        setLoadingHold(false)
        setCurrentStep(null)
        return
      }

      const formattedAmount = formatAmount(hodlAmount)
      if (!formattedAmount) {
        setLoadingHold(false)
        setCurrentStep(null)
        return
      }

      // First approve the tokens
      try {
        const approveTx = await writeContract(config as any, {
          abi: ERC20Abi,
          address: vault!.coinAddress as `0x${string}`,
          functionName: 'approve',
          args: [vault!.vaultAddress, formattedAmount],
          account: account.address as `0x${string}`,
        })

        toast({
          title: 'Approval Success',
          description: 'Tokens approved successfully, proceeding to stake...',
        })

        // Wait a bit for approval to process, then stake
        setCurrentStep('stake')
        
        setTimeout(async () => {
          try {
            const stakeTx = await writeContract(config as any, {
              abi: HodlCoinAbi,
              address: vault!.vaultAddress as `0x${string}`,
              functionName: 'hodl',
              args: [account.address as `0x${string}`, formattedAmount],
              account: account.address as `0x${string}`,
            })

            await getBalances()
            toast({
              title: 'Stake Success',
              description: 'Your tokens have been successfully staked!',
            })
            setHodlAmount('')
          } catch (error) {
            console.error('Stake error:', error)
            toast({
              title: 'Stake Failed',
              description:
                error instanceof Error ? error.message : 'Error completing stake',
            })
          } finally {
            setLoadingHold(false)
            setCurrentStep(null)
          }
        }, 2000)

      } catch (error) {
        console.error('Approval error:', error)
        toast({
          title: 'Approval Failed',
          description:
            error instanceof Error ? error.message : 'Error approving tokens',
        })
        setLoadingHold(false)
        setCurrentStep(null)
        return
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
      setLoadingHold(false)
      setCurrentStep(null)
    }
  }

  const handleMaxClick = () => {
    setHodlAmount(coinBalance.toString())
  }

  const expectedHodlCoins = hodlAmount ? parseFloat(hodlAmount) / priceHodl : 0

  const getButtonText = () => {
    if (currentStep === 'approve') return 'Approving...'
    if (currentStep === 'stake') return 'Staking...'
    return 'Approve & Stake'
  }

  return (
    <Card className='bg-background/50 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/5 hover:border-primary/30 transition-all duration-300'>
      <CardHeader>
        <CardTitle className='font-extrabold tracking-tight text-gradient text-xl flex items-center gap-3'>
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30">
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          Stake Tokens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Input Section */}
        <div className="space-y-3">
          <div className='text-sm font-semibold text-foreground flex items-center gap-2'>
            <div className="w-2 h-2 bg-primary rounded-full" />
            Amount to Stake
          </div>
          <div className='relative'>
            <Input
              type='text'
              placeholder='0.0'
              className='w-full bg-background/50 backdrop-blur-sm border-primary/30 focus:border-primary/60 
                transition-all duration-300 hover:border-primary/50 text-foreground pr-20 text-lg font-mono'
              value={hodlAmount}
              onChange={e => {
                const value = e.target.value
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setHodlAmount(value)
                }
              }}
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-2">
              <Button
                variant='ghost'
                size="sm"
                className='text-xs text-primary hover:text-primary/80 hover:bg-primary/10 px-2 py-1 h-auto'
                onClick={handleMaxClick}
              >
                MAX
              </Button>
              <span className="text-sm text-muted-foreground font-mono">
                {vault?.coinSymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Expected Output */}
        {hodlAmount && parseFloat(hodlAmount) > 0 && (
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-foreground">You will receive</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-purple-500">
                  {expectedHodlCoins.toFixed(6)}
                </span>
                <span className="text-sm text-muted-foreground">{vault?.hodlCoinSymbol}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {loadingHold ? (
          <Button
            className='w-full bg-muted hover:bg-muted text-muted-foreground cursor-not-allowed'
            disabled
          >
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            {getButtonText()}
          </Button>
        ) : (
          <Button
            onClick={hodlAction}
            disabled={!hodlAmount || parseFloat(hodlAmount) <= 0}
            className='w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-violet-600 hover:to-purple-500 
              transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 
              text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none'
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Approve & Stake
            </div>
          </Button>
        )}

        {/* Info Text */}
        <p className="text-xs text-muted-foreground text-center">
          Staking locks your tokens and mints hodlCoins. The longer you hold, the more you benefit from unstaking fees.
        </p>
      </CardContent>
    </Card>
  )
}
