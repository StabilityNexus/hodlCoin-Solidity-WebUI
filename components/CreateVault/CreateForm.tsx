'use client'

import { CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Player } from '@lottiefiles/react-lottie-player'
import Animation from '@/public/animations/congrats_animation.json'
import { toast } from '../ui/use-toast'
import Link from 'next/link'
import { readContract } from '@wagmi/core'
import { useState } from 'react'
import {
  getTransactionReceipt,
  simulateContract,
  writeContract,
} from '@wagmi/core'

import { HodlCoinVaultFactories } from '@/utils/addresses'
import { HodlCoinFactoryAbi } from '@/utils/contracts/HodlCoinFactory'

import { config } from '@/utils/config'

export default function ProfileMenu() {
  const [coinName, setCoinName] = useState<string>('')
  const [symbol, setSymbol] = useState<string>('')
  const [coin, setCoin] = useState<string>('')
  const [vaultCreator, setVaultCreator] = useState<string>('')
  const [vaultFee, setVaultFee] = useState<string>('')
  const [vaultCreatorFee, setVaultCreatorFee] = useState<string>('')
  const [stableOrderFee, setStableOrderFee] = useState<string>('')
  const [uniqueId, setUniqueId] = useState<number>(0)

  const [loadingCreation, setLoadingCreation] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)

  const [hashTx, setHashTx] = useState<string>('')

  const [errors, setErrors] = useState<{
    coinName?: string
    symbol?: string
    coin?: string
    vaultCreator?: string
    vaultFee?: string
    vaultCreatorFee?: string
    stableOrderFee?: string
  }>({})

  const validateInputs = () => {
    const Errors: any = {}

    if (!coinName) Errors.coinName = 'Name for hodlCoin is required'
    if (!symbol) Errors.symbol = 'Symbol for hodlCoin is required'
    if (!coin) Errors.coin = 'Underlying asset is required'
    if (!vaultCreator) Errors.vaultCreator = 'Vault creator address is required'
    if (!vaultFee || Number(vaultFee) <= 0)
      Errors.vaultFee = 'Vault fee must be a positive number'
    if (!vaultCreatorFee || Number(vaultCreatorFee) <= 0)
      Errors.vaultCreatorFee = 'Vault creator fee must be a positive number'
    if (!stableOrderFee || Number(stableOrderFee) <= 0)
      Errors.stableOrderFee = 'Stable order fee must be a positive number'

    setErrors(Errors)
    return Object.keys(Errors).length === 0
  }

  async function createVault() {
    if (!validateInputs()) {
      toast({
        title: 'Error',
        description: 'Please fix the errors before submitting.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoadingCreation(true)
      const chainId = config.state.chainId

      const tx = await writeContract(config as any, {
        address: HodlCoinVaultFactories[chainId],
        abi: HodlCoinFactoryAbi,
        functionName: 'createHodlCoin',
        args: [
          coinName,
          symbol,
          coin,
          vaultCreator,
          BigInt(vaultFee),
          BigInt(vaultCreatorFee),
          BigInt(stableOrderFee),
        ],
      })

      setHashTx(tx)

      const result = await simulateContract(config as any, {
        address: HodlCoinVaultFactories[chainId],
        abi: HodlCoinFactoryAbi,
        functionName: 'createHodlCoin',
        args: [
          coinName,
          symbol,
          coin,
          vaultCreator,
          BigInt(vaultFee),
          BigInt(vaultCreatorFee),
          BigInt(stableOrderFee),
        ],
      })

      console.log('result', result.result)

      toast({
        title: 'Vault Created',
        description: 'Your vault has been successfully created',
      })

      const uniqueIdOfVault = (await readContract(config as any, {
        abi: HodlCoinFactoryAbi,
        address: HodlCoinVaultFactories[chainId],
        functionName: 'vaultId',
        args: [],
      })) as number

      setUniqueId(Number(uniqueIdOfVault))

      setSubmitted(true)
    } catch (err: any) {
      console.log(err)
      toast({
        title: 'Error',
        description:
          err.message ||
          'An unexpected error occurred while creating the vault.',
        variant: 'destructive',
      })
    } finally {
      setLoadingCreation(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center p-4'>
      <div className='w-full max-w-7xl'>
        <div className='bg-background border border-secondary rounded-xl shadow-2xl'>
          <div className='p-8 md:p-12'>
            <h1 className='text-2xl md:text-3xl font-bold text-primary text-center mb-8'>
              Create Vault Form
            </h1>

            {!submitted ? (
              <div className='space-y-6'>
                <CardDescription className='space-y-6'>
                  <Input
                    type='text'
                    placeholder='Name of the hodlCoin that will be created'
                    className={`w-full h-12 text-lg ${errors.coinName ? 'border-red-500' : ''}`}
                    value={coinName}
                    onChange={e => setCoinName(e.target.value)}
                  />
                  {errors.coinName && (
                    <p className='text-red-500 text-sm'>{errors.coinName}</p>
                  )}

                  <Input
                    type='text'
                    placeholder='Ticker Symbol of the hodlCoin that will be created'
                    className={`w-full h-12 text-lg ${errors.symbol ? 'border-red-500' : ''}`}
                    value={symbol}
                    onChange={e => setSymbol(e.target.value)}
                  />
                  {errors.symbol && (
                    <p className='text-red-500 text-sm'>{errors.symbol}</p>
                  )}

                  <Input
                    type='text'
                    placeholder='Address of the ERC20 token that will be staked in the vault'
                    className={`w-full h-12 text-lg ${errors.coin ? 'border-red-500' : ''}`}
                    value={coin}
                    onChange={e => setCoin(e.target.value)}
                  />
                  {errors.coin && (
                    <p className='text-red-500 text-sm'>{errors.coin}</p>
                  )}

                  <Input
                    type='text'
                    placeholder="Address where you would like to receive the vault creator's portion of the unstaking fee"
                    className={`w-full h-12 text-lg ${errors.vaultCreator ? 'border-red-500' : ''}`}
                    value={vaultCreator}
                    onChange={e => setVaultCreator(e.target.value)}
                  />
                  {errors.vaultCreator && (
                    <p className='text-red-500 text-sm'>
                      {errors.vaultCreator}
                    </p>
                  )}

                  <div className='relative w-full'>
                    <Input
                      type='number'
                      placeholder='Unstaking fee that remains in the vault'
                      className='w-full h-12 text-lg pr-10'
                      value={vaultFee}
                      onChange={e => setVaultFee(e.target.value)}
                    />
                    {errors.vaultFee && (
                      <p className='text-red-500 text-sm'>{errors.vaultFee}</p>
                    )}
                    <span className='absolute inset-y-0 right-4 flex items-center text-gray-500'>
                      %
                    </span>
                  </div>
                  <div className='relative w-full'>
                    <Input
                      type='number'
                      placeholder="Unstaking fee that is sent to this vault's creator"
                      className={`w-full h-12 text-lg ${errors.vaultCreatorFee ? 'border-red-500' : ''}`}
                      value={vaultCreatorFee}
                      onChange={e => setVaultCreatorFee(e.target.value)}
                    />
                    {errors.vaultCreatorFee && (
                      <p className='text-red-500 text-sm'>
                        {errors.vaultCreatorFee}
                      </p>
                    )}
                    <span className='absolute inset-y-0 right-4 flex items-center text-gray-500'>
                      %
                    </span>
                  </div>

                  <div className='pt-4'>
                    {loadingCreation ? (
                      <Button className='w-full h-12 text-lg' disabled>
                        <Loader2 className='mr-3 h-5 w-5 animate-spin' />
                        Creating Vault...
                      </Button>
                    ) : (
                      <Button
                        className='w-full h-12 text-lg'
                        onClick={createVault}
                      >
                        Create HodlCoin Vault
                      </Button>
                    )}
                  </div>
                </CardDescription>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center space-y-8 py-8'>
                <Player src={Animation} className='player h-48' loop autoplay />
                <p className='text-lg text-center'>
                  Your vault has been successfully created with Unique Id{' '}
                  {uniqueId + 1}
                </p>
                <Link href='/'>
                  <Button
                    onClick={() =>
                      window.open(`https://sepolia.scrollscan.com/tx/${hashTx}`)
                    }
                    variant='outline'
                    className='h-12 text-lg'
                  >
                    See the transaction on-chain
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
