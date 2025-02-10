'use client'

import { vaultsProps } from '@/utils/props'
import { useAccount } from 'wagmi'
import { useEffect, useRef, useState } from 'react'
import { Coins, Loader2, LockKeyhole, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '../ui/use-toast'
import { writeContract } from '@wagmi/core'
import { config } from '@/utils/config'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'
import { ERC20Abi } from '@/utils/contracts/ERC20'

export default function HeroVault({
  vault,
  priceHodl,
  reserve,
  supply,
}: {
  vault: vaultsProps | null
  priceHodl: any
  reserve: any
  supply: any
}) {
  const [isRewardPopupVisible, setIsRewardPopupVisible] = useState(false)
  const [rewardAmount, setRewardAmount] = useState<number>(0)
  const popupRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

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

    if (rewardAmount === null || rewardAmount <= 0) {
      toast({
        title: 'Amount Invalid',
        description: 'Please input a valid amount',
      })
      return false
    }

    return true
  }

  const formatAmount = (amount: number) => {
    try {
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

  const handleRewardSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault() // Prevent default button behavior

    try {
      setIsLoading(true)

      if (!validateInputs()) {
        setIsLoading(false)
        return
      }

      const formattedAmount = formatAmount(rewardAmount)
      if (!formattedAmount) {
        setIsLoading(false)
        return
      }
      const tx = await writeContract(config as any, {
        abi: HodlCoinAbi,
        address: vault?.vaultAddress as `0x${string}`,
        functionName: 'transfer',
        args: [
          vault?.vaultAddress as `0x${string}`,
          formattedAmount,
        ],
        account: account.address as `0x${string}`,
      })

      toast({
        title: 'Reward Sent',
        description: 'Your reward has been successfully transferred',
      })

      setRewardAmount(0)
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
      setIsLoading(false)
    }
  }

  const handleClosePopup = () => {
    if (!isLoading) {
      setIsRewardPopupVisible(false)
      setRewardAmount(0)
    }
  }

  return (
    <main className='container mx-auto p-4'>
      <div className='relative'>
        <Card className='bg-white dark:bg-[#121212] border-gray-200 dark:border-gray-900 transition-colors duration-200'>
          <CardHeader>
            <div className='flex justify-between items-center'>
              <CardTitle className='font-bold text-amber-600 dark:text-yellow-300'>
                Vault Overview
              </CardTitle>
              <Button
                className='hover:bg-yellow-500'
                onClick={() => setIsRewardPopupVisible(true)}
              >
                Reward Stakers
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-colors duration-200'>
                <div className='flex items-center gap-2 text-gray-600 font-bold dark:text-gray-400 mb-2'>
                  <Coins className='h-4 w-4' />
                  Price
                </div>
                <div className='text-2xl font-mono text-gray-900 dark:text-white'>
                  {priceHodl} {vault?.coinSymbol}
                </div>
              </div>
              <div className='bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-colors duration-200'>
                <div className='flex items-center gap-2 text-gray-600 font-bold dark:text-gray-400 mb-2'>
                  <LockKeyhole className='h-4 w-4' />
                  Total Value Locked
                </div>
                <div className='text-2xl font-mono text-gray-900 dark:text-white'>
                  {reserve} {vault?.coinSymbol}
                </div>
              </div>
              <div className='bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-colors duration-200'>
                <div className='flex items-center gap-2 text-gray-600 font-bold dark:text-gray-400 mb-2'>
                  <TrendingUp className='h-4 w-4' />
                  Supply
                </div>
                <div className='text-2xl font-mono text-gray-900 dark:text-white'>
                  {supply} h{vault?.coinSymbol}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isRewardPopupVisible && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div
              ref={popupRef}
              className='bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 w-full max-w-md'
            >
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-xl font-semibold text-yellow-500'>
                  Reward Stakers
                </h3>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleClosePopup}
                  disabled={isLoading}
                  aria-label='Close reward popup'
                >
                  <p className='h-5 w-5'>x</p>
                </Button>
              </div>
              <div className='space-y-4'>
                <div className='relative'>
                  <Input
                    id='reward-amount'
                    type='number'
                    value={rewardAmount}
                    onChange={e => {
                      const value = parseFloat(e.target.value)
                      setRewardAmount(value)
                    }}
                    placeholder='Enter amount'
                    className='bg-[#141414] border-gray-800 text-white pr-12' // Add padding to the right
                    disabled={isLoading}
                    min={0}
                    step='any'
                  />
                  <span className='absolute inset-y-0 right-4 flex items-center text-gray-200'>
                    PTK
                  </span>
                </div>

                {isLoading ? (
                  <Button
                    className='w-full hover:bg-yellow-600 text-black'
                    disabled
                  >
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Please wait
                  </Button>
                ) : (
                  <Button
                    className='w-full hover:bg-yellow-600 text-black'
                    onClick={handleRewardSubmit}
                  >
                    Reward
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}