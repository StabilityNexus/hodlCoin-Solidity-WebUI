'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight } from 'lucide-react'
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

const BLOCK_EXPLORERS: { [key: number]: string } = {
  1: 'https://etherscan.io',
  61: 'https://blockscout.com/etc/mainnet',
  2001: 'https://explorer-mainnet-cardano-evm.c1.milkomeda.com',
  534351: 'https://sepolia.scrollscan.com',
  5115: 'https://explorer.testnet.citrea.xyz',
}

export default function CreateForm() {
  const [coinName, setCoinName] = useState<string>('')
  const [symbol, setSymbol] = useState<string>('')
  const [coin, setCoin] = useState<string>('')
  const [vaultCreator, setVaultCreator] = useState<string>('')
  const [vaultFee, setVaultFee] = useState<string>('')
  const [vaultCreatorFee, setVaultCreatorFee] = useState<string>('')
  const [stableOrderFee, ] = useState<string>('')
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
  }>({})

  const convertFeeToNumerator = (fee: string): bigint => {
    const feeNumber = parseFloat(fee)
    return BigInt(Math.round(feeNumber * 1000))
  }

  const validateInputs = () => {
    const Errors: any = {}

    if (!coinName) Errors.coinName = 'Name for hodlCoin is required'
    if (!symbol) Errors.symbol = 'Symbol for hodlCoin is required'
    if (!coin) Errors.coin = 'Underlying asset is required'
    if (!vaultCreator) Errors.vaultCreator = 'Vault creator address is required'
    if (vaultFee === '') Errors.vaultFee = 'Vault fee is required'
    if (vaultCreatorFee === '')
      Errors.vaultCreatorFee = 'Vault creator fee is required'
    if (Number(vaultFee) < 0) Errors.vaultFee = 'Vault fee cannot be negative'
    if (Number(vaultCreatorFee) < 0)
      Errors.vaultCreatorFee = 'Vault creator fee cannot be negative'

    setErrors(Errors)
    return Object.keys(Errors).length === 0
  }

  const getBlockExplorerUrl = (chainId: number, txHash: string) => {
    const baseUrl = BLOCK_EXPLORERS[chainId] || 'https://etherscan.io'
    return `${baseUrl}/tx/${txHash}`
  }

  async function createVault() {
    if (!validateInputs()) {
      toast({
        title: 'Error',
        description: 'Please fix the errors before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoadingCreation(true)
      const chainId = config.state.chainId

      const vaultFeeNumerator = convertFeeToNumerator(vaultFee)
      const vaultCreatorFeeNumerator = convertFeeToNumerator(vaultCreatorFee)

      const tx = await writeContract(config as any, {
        address: HodlCoinVaultFactories[chainId],
        abi: HodlCoinFactoryAbi,
        functionName: 'createHodlCoin',
        args: [
          coinName,
          symbol,
          coin,
          vaultCreator,
          vaultFeeNumerator,
          vaultCreatorFeeNumerator,
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
          vaultFeeNumerator,
          vaultCreatorFeeNumerator,
          BigInt(stableOrderFee),
        ],
      })

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
    <div className="relative min-h-screen mt-32 bg-background">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {!submitted ? (
            <Card className="bg-background/50 backdrop-blur-sm border-primary/20 bg-gray-50 dark:bg-gray-700">
              <CardHeader className="space-y-2">
                <CardTitle className="text-3xl font-extrabold tracking-tight text-center text-gradient">
                  Create New Vault
                </CardTitle>
                <CardDescription className="text-center text-muted-foreground font-medium">
                  Fill in the details below to create your new staking vault
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Name of the hodlCoin that will be created"
                      className={`w-full h-12 text-sm bg-background/50 border-primary/20 focus:border-primary/40 font-medium ${errors.coinName ? 'border-red-500' : ''}`}
                      value={coinName}
                      onChange={e => setCoinName(e.target.value)}
                    />
                    {errors.coinName && (
                      <p className="text-red-500 text-sm font-medium">{errors.coinName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Ticker Symbol of the hodlCoin that will be created"
                      className={`w-full h-12 text-sm bg-background/50 border-primary/20 focus:border-primary/40 font-medium ${errors.symbol ? 'border-red-500' : ''}`}
                      value={symbol}
                      onChange={e => setSymbol(e.target.value)}
                    />
                    {errors.symbol && (
                      <p className="text-red-500 text-sm font-medium">{errors.symbol}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Address of the ERC20 token that will be staked in the vault"
                      className={`w-full h-12 text-sm bg-background/50 border-primary/20 focus:border-primary/40 font-medium ${errors.coin ? 'border-red-500' : ''}`}
                      value={coin}
                      onChange={e => setCoin(e.target.value)}
                    />
                    {errors.coin && (
                      <p className="text-red-500 text-sm font-medium">{errors.coin}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Address where you would like to receive the vault creator's portion of the unstaking fee"
                      className={`w-full h-12 text-sm bg-background/50 border-primary/20 focus:border-primary/40 font-medium ${errors.vaultCreator ? 'border-red-500' : ''}`}
                      value={vaultCreator}
                      onChange={e => setVaultCreator(e.target.value)}
                    />
                    {errors.vaultCreator && (
                      <p className="text-red-500 text-sm font-medium">{errors.vaultCreator}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Unstaking fee that remains in the vault"
                        className={`w-full h-12 text-sm bg-background/50 border-primary/20 focus:border-primary/40 pr-10 font-medium ${errors.vaultFee ? 'border-red-500' : ''}`}
                        value={vaultFee}
                        onChange={e => setVaultFee(e.target.value)}
                      />
                      <span className="absolute inset-y-0 right-4 flex items-center text-muted-foreground">
                        %
                      </span>
                    </div>
                    {errors.vaultFee && (
                      <p className="text-red-500 text-sm font-medium">{errors.vaultFee}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Unstaking fee that is sent to this vault's creator"
                        className={`w-full h-12 text-sm bg-background/50 border-primary/20 focus:border-primary/40 pr-10 font-medium ${errors.vaultCreatorFee ? 'border-red-500' : ''}`}
                        value={vaultCreatorFee}
                        onChange={e => setVaultCreatorFee(e.target.value)}
                      />
                      <span className="absolute inset-y-0 right-4 flex items-center text-muted-foreground">
                        %
                      </span>
                    </div>
                    {errors.vaultCreatorFee && (
                      <p className="text-red-500 text-sm font-medium">{errors.vaultCreatorFee}</p>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={createVault}
                  disabled={loadingCreation}
                >
                  {loadingCreation ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Vault...
                    </>
                  ) : (
                    <>
                      Create Vault
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center space-y-8">
              <div className="w-32 h-32 mx-auto">
                <Player
                  autoplay
                  loop
                  src={Animation}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                Vault Created Successfully!
              </h2>
              <p className="text-muted-foreground">
                Your vault has been created with ID: {uniqueId}
              </p>
              <div className="space-y-4">
                <Link
                  href={getBlockExplorerUrl(config.state.chainId, hashTx)}
                  target="_blank"
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                >
                  View Transaction
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <div>
                  <Link href="/explorer">
                    <Button variant="outline" className="mt-4">
                      Back to Explorer
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
