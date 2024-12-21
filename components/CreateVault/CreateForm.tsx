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
import { WagmiProvider, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { getTransactionReceipt, simulateContract, writeContract } from '@wagmi/core'

import { HodlCoinVaultFactories } from '@/utils/addresses'
import { HodlCoinFactoryAbi } from '@/utils/contracts/HodlCoinFactory'
import { getChainId, waitForTransactionReceipt } from 'viem/actions'

import { config } from '@/utils/config'
import { ERC20Abi } from '@/utils/contracts/ERC20'

export default function ProfileMenu() {
  //const { data: hash, writeContract } = useWriteContract()

  const [coinName, setCoinName] = useState<string>('')
  const [vaultName, setVaultName] = useState<string>('')
  const [symbol, setSymbol] = useState<string>('')
  const [coin, setCoin] = useState<string>('')
  const [vaultCreator, setVaultCreator] = useState<string>('')
  const [stableOrder, setStableOrder] = useState<string>('')
  const [vaultFee, setVaultFee] = useState<string>('')
  const [vaultCreatorFee, setVaultCreatorFee] = useState<string>('')
  const [stableOrderFee, setStableOrderFee] = useState<string>('')
  const [uniqueId, setUniqueId] = useState<number>(0)

  const [loadingCreation, setLoadingCreation] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [hashTx, setHashTx] = useState<string>('');

  async function createVault() {
    try {
      setLoadingCreation(true)
      const chainId = config.state.chainId;
      
      const tx = await writeContract(config as any, {
        address: HodlCoinVaultFactories[chainId],
        abi: HodlCoinFactoryAbi,
        functionName: 'createHodlCoin',
        args: [
          vaultName,
          coinName,
          symbol,
          coin,
          vaultCreator,
          stableOrder,
          BigInt(vaultFee),
          BigInt(vaultCreatorFee),
          BigInt(stableOrderFee),
        ],
      });

      setHashTx(tx);

      const result = await simulateContract(config as any, {
        address: HodlCoinVaultFactories[chainId],
        abi: HodlCoinFactoryAbi,
        functionName: 'createHodlCoin',
        args: [
          vaultName,
          coinName,
          symbol,
          coin,
          vaultCreator,
          stableOrder,
          BigInt(vaultFee),
          BigInt(vaultCreatorFee),
          BigInt(stableOrderFee),
        ],
      });

      console.log('result', result.result);

      toast({
        title: 'Vault Created',
        description: 'Your vault has been successfully created',
      })

      const uniqueIdOfVault = (await readContract(config as any, {
        abi: HodlCoinFactoryAbi,
        address: HodlCoinVaultFactories[chainId],
        functionName: 'getTotalNumberOfVaults',
        args: [],
      })) as number

      setUniqueId(Number(uniqueIdOfVault))

      setSubmitted(true);
    } catch (err) {
      console.log(err)
    } finally {
      setLoadingCreation(false)
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
              <CardDescription className='mt-8 text-foreground'>
                <Input
                  type='text'
                  placeholder='Vault Name'
                  className='w-full'
                  value={vaultName}
                  onChange={e => setVaultName(e.target.value)}
                />

                <Input
                  type='text'
                  placeholder='Coin Name'
                  className='w-full mt-4'
                  value={coinName}
                  onChange={e => setCoinName(e.target.value)}
                />

                <Input
                  type='text'
                  placeholder='Coin Symbol (ticker)'
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
                  value={vaultCreator}
                  onChange={e => setVaultCreator(e.target.value)}
                />

                <Input
                  type='text'
                  placeholder='Dev Treasury (address)'
                  className='w-full mt-4'
                  value={stableOrder}
                  onChange={e => setStableOrder(e.target.value)}
                />

                <Input
                  type='number'
                  placeholder='Vault Fee (in percentage)'
                  className='w-full mt-4'
                  value={vaultFee}
                  onChange={e => setVaultFee(e.target.value)}
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
                  placeholder='Stable Order Fee (in percentage)'
                  className='w-full mt-4'
                  value={stableOrderFee}
                  onChange={e => setStableOrderFee(e.target.value)}
                />

                <div className='mt-6'>
                  {loadingCreation ? (
                    <Button className='w-full mt-4' disabled>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Creating Vault...
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
                    Your vault has been successfully created with Unique Id {uniqueId+1}
                  </p>
                  <Link href='/'>
                    <Button
                      onClick={() =>
                        window.open(
                          `https://sepolia.scrollscan.com/tx/${hashTx}`,
                        )
                      }
                      variant='outline'
                    >
                      See the transaction on-chain
                    </Button>
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
