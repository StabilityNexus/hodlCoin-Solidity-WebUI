'use client'

import { CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Player } from '@lottiefiles/react-lottie-player'
import Animation from '@/public/animations/congrats_animation.json'
import { toast } from '../ui/use-toast'
import Link from 'next/link'
import { useState } from 'react'
import { WagmiProvider, useWriteContract } from 'wagmi'

import { HodlCoinVaultFactories } from '@/utils/addresses'
import { HodlCoinFactoryAbi } from '@/utils/contracts/HodlCoinFactory'
import { getChainId } from 'viem/actions'

import { config } from '@/utils/config'
import { ERC20Abi } from '@/utils/contracts/ERC20'

export default function ProfileMenu() {
  const { data: hash, writeContract } = useWriteContract()

  const [name, setName] = useState<string>('')
  const [symbol, setSymbol] = useState<string>('')
  const [coin, setCoin] = useState<string>('')
  const [vaultCreatorTreasury, setVaultCreatorTreasury] = useState<string>('')
  const [devTreasury, setDevTreasury] = useState<string>('')
  const [reserveFee, setReserveFee] = useState<string>('')
  const [vaultCreatorFee, setVaultCreatorFee] = useState<string>('')
  const [devFee, setDevFee] = useState<string>('')
  const [initialReserve, setInitialReserve] = useState<string>('')

  const [loadingCreation, setLoadingCreation] = useState<boolean>(false)
  const [loadingApproval, setLoadingApproval] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)

  async function approveInitialReserve() {
    try {
      setLoadingApproval(true)

      console.log('Approving initial reserve')

      const chainId = config.state.chainId

      //const chainId = await getChainId(config)

      writeContract({
        address: coin as `0x${string}`,
        abi: ERC20Abi,
        functionName: 'approve',
        args: [HodlCoinVaultFactories[chainId], BigInt(initialReserve)],
      })
    } catch (err) {
      console.log(err)
    } finally {
      setLoadingApproval(false)
      toast({
        title: 'Approval Done',
        description: 'Your approval has been successfully completed',
      })
    }
  }

  async function createVault() {
    try {
      setLoadingCreation(true)
      const chainId = config.state.chainId

      writeContract({
        address: HodlCoinVaultFactories[chainId],
        abi: HodlCoinFactoryAbi,
        functionName: 'createHodlCoin',
        args: [
          name,
          symbol,
          coin,
          vaultCreatorTreasury,
          devTreasury,
          BigInt(reserveFee),
          BigInt(vaultCreatorFee),
          BigInt(devFee),
          BigInt(initialReserve),
        ],
      })
    } catch (err) {
      console.log(err)
    } finally {
      setLoadingCreation(false)
      toast({
        title: 'Vault Created',
        description: 'Your vault has been successfully created',
      })
      setSubmitted(true)
    }
  }

  return (
    <div className='w-full flex flex-col items-center justify-center py-4'>
      <div className='w-[80%] flex flex-row mb-24'>
        <div className='shadow-2xl border-[1px] border-secondary rounded-lg flex-1 py-8'>
          <h1 className='px-12 text-xl font-bold text-primary'>
            Create Vault Form
          </h1>
          {!submitted ? (
            <div className='px-12 pt-4'>
              <CardDescription className='mt-8'>
                <Input
                  type='text'
                  placeholder='Name'
                  className='w-full'
                  value={name}
                  onChange={e => setName(e.target.value)}
                />

                <Input
                  type='text'
                  placeholder='Symbol (ticker)'
                  className='w-full mt-4'
                  value={symbol}
                  onChange={e => setSymbol(e.target.value)}
                />

                <Input
                  type='text'
                  placeholder='Underlying Asset (ERC 20)'
                  className='w-full mt-4'
                  value={coin}
                  onChange={e => setCoin(e.target.value)}
                />

                <Input
                  type='text'
                  placeholder='Vault Creator Treasury (address)'
                  className='w-full mt-4'
                  value={vaultCreatorTreasury}
                  onChange={e => setVaultCreatorTreasury(e.target.value)}
                />

                <Input
                  type='text'
                  placeholder='Dev Treasury (address)'
                  className='w-full mt-4'
                  value={devTreasury}
                  onChange={e => setDevTreasury(e.target.value)}
                />

                <Input
                  type='number'
                  placeholder='Reserve Fee (in percentage)'
                  className='w-full mt-4'
                  value={reserveFee}
                  onChange={e => setReserveFee(e.target.value)}
                />

                <Input
                  type='number'
                  placeholder='Vault Creator Fee (in percentage)'
                  className='w-full mt-4'
                  value={vaultCreatorFee}
                  onChange={e => setVaultCreatorFee(e.target.value)}
                />

                <Input
                  type='number'
                  placeholder='Dev Fee (in percentage)'
                  className='w-full mt-4'
                  value={devFee}
                  onChange={e => setDevFee(e.target.value)}
                />

                <Input
                  type='number'
                  placeholder='Initial Reserve (THESE TOKENS WILL BECOME UNAVAILABLE)'
                  className='w-full mt-4'
                  value={initialReserve}
                  onChange={e => setInitialReserve(e.target.value)}
                />
                <div className='mt-6'>
                  {loadingApproval ? (
                    <Button className='w-full mt-4' disabled>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Loading...
                    </Button>
                  ) : (
                    <Button
                      className='w-full mt-4'
                      onClick={approveInitialReserve}
                    >
                      Approve Initial Reserve (The tokens WILL BECOME
                      UNAVAILABLE)
                    </Button>
                  )}

                  {loadingCreation ? (
                    <Button className='w-full mt-4' disabled>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Loading...
                    </Button>
                  ) : (
                    <Button className='w-full mt-4' onClick={createVault}>
                      Create HodlCoin Vault
                    </Button>
                  )}
                </div>
              </CardDescription>
            </div>
          ) : (
            <div className='px-12 pt-4'>
              <CardDescription className='mt-8'>
                <div className='flex flex-col justify-center items-center space-y-6'>
                  <Player
                    src={Animation}
                    className='player h-36'
                    loop
                    autoplay
                  />
                  <p className='text-sm'>
                    Your vault has been successfully created
                  </p>
                  <Link href='/'>
                    <Button variant='outline'>Go back to Home</Button>
                  </Link>
                </div>
              </CardDescription>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
