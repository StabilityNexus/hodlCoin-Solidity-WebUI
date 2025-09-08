'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight } from 'lucide-react'
import { Player } from '@lottiefiles/react-lottie-player'
import Animation from '@/public/animations/congrats_animation.json'
import { toast } from '../ui/use-toast'
import Link from 'next/link'
import {  readContract } from '@wagmi/core'
import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import {
  simulateContract,
  writeContract,
} from '@wagmi/core'

import { HodlCoinVaultFactories } from '@/utils/addresses'
import { HodlCoinFactoryAbi } from '@/utils/contracts/HodlCoinFactory'
import { ERC20Abi } from '@/utils/contracts/ERC20'

import { config } from '@/utils/config'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { TokenSchema } from '../hooks/useTokenList'
import TokenPicker from './TokenPicker'

const BLOCK_EXPLORERS: { [key: number]: string } = {
  1: 'https://etherscan.io',
  61: 'https://blockscout.com/etc/mainnet',
  137: 'https://polygonscan.com',
  8453: 'https://basescan.org',
  2001: 'https://explorer-mainnet-cardano-evm.c1.milkomeda.com',
  534351: 'https://sepolia.scrollscan.com',
  5115: 'https://explorer.testnet.citrea.xyz',
}

export default function CreateForm() {
  const account = useAccount()
  const activeChainId = useChainId();
  const[token,setToken] = useState<TokenSchema | null > (null) 
  const [coinName, setCoinName] = useState<string>('')
  const [symbol, setSymbol] = useState<string>('')
  const [coin, setCoin] = useState<string>('')
  const [vaultCreator, setVaultCreator] = useState<string>('')
  const [vaultFee, setVaultFee] = useState<string>('')
  const [vaultCreatorFee, setVaultCreatorFee] = useState<string>('')
  const [stableOrderFee, ] = useState<string>('')
  const [uniqueId, setUniqueId] = useState<number>(0)
  const [vaultAddress, setVaultAddress] = useState<string>('')

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

  // Pre-fill vault creator with connected wallet address
  useEffect(() => {
    if (account.address && !vaultCreator) {   
      setVaultCreator(account.address)
    }
  }, [account.address, vaultCreator])

  useEffect(()=>{
    setToken(null);
    setCoin('');
    setSymbol('')
  },[activeChainId])

  // Fetch symbol from underlying asset and pre-fill vault symbol
  useEffect(() => {
    const fetchTokenSymbol = async () => {
      if (!coin || coin.length !== 42 || !coin.startsWith('0x')) return
      
      try {
        const tokenSymbol = await readContract(config as any, {
          abi: ERC20Abi,
          address: coin as `0x${string}`,
          functionName: 'symbol',
          args: [],
        }) as string
        if (tokenSymbol) {
          setSymbol(`h${tokenSymbol}`)
        }
      } catch (error) {
        console.log('Error fetching token symbol:', error)
      }
    }

    fetchTokenSymbol()
  }, [coin])

  

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

  const getAddressExplorerUrl = (chainId: number, address: string) => {
    const baseUrl = BLOCK_EXPLORERS[chainId] || 'https://etherscan.io'
    return `${baseUrl}/address/${address}`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
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
          coin as `0x${string}`,
          vaultCreator as `0x${string}`,
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
          coin as `0x${string}`,
          vaultCreator as `0x${string}`,
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
      })) as unknown as number

      // Get the vault address using the vault ID
      const vaultData = (await readContract(config as any, {
        abi: HodlCoinFactoryAbi,
        address: HodlCoinVaultFactories[chainId],
        functionName: 'vaults',
        args: [BigInt(Number(uniqueIdOfVault) - 1)], // Subtract 1 because vaultId is incremented after creation
      })) as [string, string, string, string]

      setUniqueId(Number(uniqueIdOfVault))
      setVaultAddress(vaultData[0]) // vaultAddress is the first element in the tuple
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
    <div className="relative min-h-screen mt-16 page-3d flex items-center justify-center bg-background">
      {/* Enhanced Background Elements with 3D effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-4 w-96 h-96 bg-gray-200/20 dark:bg-primary/15 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob floating-3d" />
        <div className="absolute top-20 -right-4 w-96 h-96 bg-gray-300/20 dark:bg-purple-400/15 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 floating-3d" />
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gray-400/15 dark:bg-blue-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000 floating-3d" />
      </div>

      <div className="relative w-full max-w-3xl mx-auto px-4 py-8">
        {!submitted ? (
          <Card className="bg-background/95 backdrop-blur-sm border-primary/30 shadow-xl dark:bg-card/95 dark:border-primary/40">
            <CardHeader className="space-y-2">
              <CardTitle className="pb-2 text-3xl font-extrabold tracking-tight text-center text-gradient">
                Create New Staking Vault
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/90 text-3d">Vault Name</label>
                <Input
                  type="text"
                  placeholder="Name of the hodlCoin Vault"
                  className={`w-full h-10 text-sm bg-background/80 border-black focus:border-primary/60 font-medium placeholder:text-muted-foreground/70 dark:bg-background/60 dark:border-border/40 dark:focus:border-primary/70 input-3d ${errors.coinName ? 'border-red-500 dark:border-red-400' : ''}`}
                  value={coinName}
                  onChange={e => setCoinName(e.target.value)}
                />
                {errors.coinName && (
                  <p className="text-red-500 text-xs font-medium text-3d">{errors.coinName}</p>
                )}
              </div>

              <Tabs defaultValue="picker" className="w-full">
                <TabsList className="grid w-full grid-cols-2 border-2 rounded-md border-gray-400 h-full mb-2">
                  <TabsTrigger
                    value="picker"
                    className="hover:bg-muted data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                  >
                    Select Token
                  </TabsTrigger>
                  <TabsTrigger
                    value="manual"
                    className="hover:bg-muted data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                  >
                    Enter Token Contract Address
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="picker" className="mt-0">
                <TokenPicker
                  selected={
                    coin
                      ? {
                          id: token?.id ?? coin,
                          contract_address: token?.contract_address ?? coin,
                          symbol: token?.symbol ?? '',
                          name: token?.name ?? '',
                          image: token?.image ?? '',
                        }
                      : null
                      
                  }

                  onSelect={(token) => {
                    setCoin(token.contract_address)
                    setToken(token)
                    setSymbol(`h${token.symbol}`)
                   
                  }}
                  chainId={activeChainId}
                  placeholder="Select a token to stake"
                />
                </TabsContent>
                <TabsContent value="manual" className="mt-0">
                   
                <Input
                  type="text"
                  placeholder="0x... ERC20 contract address of the token that will be staked in this vault"
                  className={`w-full h-10 text-sm bg-background/80 border-black focus:border-primary/60 font-medium placeholder:text-muted-foreground/70 dark:bg-background/60 dark:border-border/40 dark:focus:border-primary/70 input-3d font-mono ${errors.coin ? 'border-red-500 dark:border-red-400' : ''}`}
                  value={coin}
                  onChange={e => setCoin(e.target.value)}
                />
                {errors.coin && (
                  <p className="text-red-500 text-xs font-medium text-3d">{errors.coin}</p>
                )}


                  </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/90 text-3d">Symbol for the Staking Token</label>
                <Input
                  type="text"
                  placeholder="Ticker Symbol (e.g., hBTC, hETH)"
                  className={`w-full h-10 text-sm bg-background/80 border-black focus:border-primary/60 font-medium placeholder:text-muted-foreground/70 dark:bg-background/60 dark:border-border/40 dark:focus:border-primary/70 input-3d ${errors.symbol ? 'border-red-500 dark:border-red-400' : ''}`}
                  value={symbol}
                  onChange={e => setSymbol(e.target.value)}
                />
                {errors.symbol && (
                  <p className="text-red-500 text-xs font-medium text-3d">{errors.symbol}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/90 text-3d">Unstaking Fee for the Vault (%)</label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Fee percentage"
                      className={`w-full h-10 text-sm bg-background/80 border-black focus:border-primary/60 pr-10 font-medium placeholder:text-muted-foreground/70 dark:bg-background/60 dark:border-border/40 dark:focus:border-primary/70 input-3d ${errors.vaultFee ? 'border-red-500 dark:border-red-400' : ''}`}
                      value={vaultFee}
                      onChange={e => setVaultFee(e.target.value)}
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground font-semibold text-sm">
                      %
                    </span>
                  </div>
                  {errors.vaultFee && (
                    <p className="text-red-500 text-xs font-medium text-3d">{errors.vaultFee}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/90 text-3d">Unstaking Fee for the Vault Creator (%)</label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Fee sent to creator"
                      className={`w-full h-10 text-sm bg-background/80 border-black focus:border-primary/60 pr-10 font-medium placeholder:text-muted-foreground/70 dark:bg-background/60 dark:border-border/40 dark:focus:border-primary/70 input-3d ${errors.vaultCreatorFee ? 'border-red-500 dark:border-red-400' : ''}`}
                      value={vaultCreatorFee}
                      onChange={e => setVaultCreatorFee(e.target.value)}
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground font-semibold text-sm">
                      %
                    </span>
                  </div>
                  {errors.vaultCreatorFee && (
                    <p className="text-red-500 text-xs font-medium text-3d">{errors.vaultCreatorFee}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/90 text-3d">Vault Creator Address</label>
                <Input
                  type="text"
                  placeholder="0x... Address to receive creator fee"
                  className={`w-full h-10 text-sm bg-background/80 border-black focus:border-primary/60 font-medium placeholder:text-muted-foreground/70 dark:bg-background/60 dark:border-border/40 dark:focus:border-primary/70 input-3d font-mono ${errors.vaultCreator ? 'border-red-500 dark:border-red-400' : ''}`}
                  value={vaultCreator}
                  onChange={e => setVaultCreator(e.target.value)}
                />
                {errors.vaultCreator && (
                  <p className="text-red-500 text-xs font-medium text-3d">{errors.vaultCreator}</p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  className="w-full h-12 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white font-bold text-base shadow-2xl hover:shadow-3xl transition-all duration-500 button-3d relative overflow-hidden"
                  onClick={createVault}
                  disabled={loadingCreation}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  {loadingCreation ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span className="text-3d">Creating Vault...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-3d relative z-10">Create Vault</span>
                      <ArrowRight className="ml-2 h-5 w-5 relative z-10" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-3d bg-background/95 backdrop-blur-lg border-primary/30 shadow-2xl dark:bg-card/95 dark:border-primary/40">
            <CardContent className="text-center space-y-6 py-8">
              <div className="w-32 h-32 mx-auto floating-3d">
                <Player
                  autoplay
                  loop
                  src={Animation}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gradient text-3d-glow">
                  Vault Created Successfully!
                </h2>
                <p className="text-base text-muted-foreground text-3d">
                  Your vault has been deployed at address:
                </p>
                <div className="bg-background/50 dark:bg-background/30 border border-primary/20 rounded-lg p-3 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">{formatAddress(vaultAddress)}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(vaultAddress)
                        toast({
                          title: 'Copied!',
                          description: 'Vault address copied to clipboard',
                        })
                      }}
                      className="text-xs bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
                <Link
                  href={getBlockExplorerUrl(config.state.chainId, hashTx)}
                  target="_blank"
                >
                  <Button 
                    variant="outline" 
                    className="h-10 px-4 border-primary/30 hover:bg-primary/10 dark:border-primary/40 dark:hover:bg-primary/20 button-3d"
                  >
                    <span className="text-3d">View Transaction</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/v?chainId=${config.state.chainId}&vault=${vaultAddress}`}>
                  <Button className="h-10 px-6 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 button-3d">
                    <span className="text-3d">Go to Vault</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
