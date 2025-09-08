import { vaultsProps } from '@/utils/props'
import { Coins, Info, ExternalLink, User, Percent, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const BLOCK_EXPLORERS: { [key: number]: string } = {
  1: 'https://etherscan.io',
  61: 'https://blockscout.com/etc/mainnet',
  137: 'https://polygonscan.com',
  8453: 'https://basescan.org',
  2001: 'https://explorer-mainnet-cardano-evm.c1.milkomeda.com',
  534351: 'https://sepolia.scrollscan.com',
  5115: 'https://explorer.testnet.citrea.xyz',
}

export default function VaultInformation({
  vault,
  vaultFee,
  vaultCreatorFee,
  stableOrderFee,
  vaultCreator,
}: {
  vault: vaultsProps | null
  vaultFee: number
  vaultCreatorFee: number
  stableOrderFee: number
  vaultCreator: string
}) {
  const getBlockExplorerUrl = (address: string) => {
    const chainId = vault?.chainId ?? 534351; 
    const baseUrl = BLOCK_EXPLORERS[chainId] || 'https://etherscan.io'
    return `${baseUrl}/address/${address}`
  }

  const openExplorer = (address: string) => {
    window.open(getBlockExplorerUrl(address), '_blank')
  }

  const formatFee = (fee: number) => {
    return fee / 1000
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <main className='container mx-auto p-4 mb-8'>
      <Card className='bg-background/50 max-w-7xl backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/5 hover:border-primary/30 transition-all duration-300'>
        <CardContent className='p-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Contract Information */}
            <div className='space-y-6'>
              <div className='flex items-center gap-3 mb-6'>
                <div className="p-2 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <h3 className='text-xl font-bold text-gradient'>Contract Addresses</h3>
              </div>
              
              <div className='space-y-4'>
                <div className="group">
                  <h4 className='text-sm font-semibold text-foreground mb-2 flex items-center gap-2'>
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    {vault?.coinName} Token Contract
                  </h4>
                  <div className='bg-background/30 backdrop-blur-sm border border-primary/20 rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:border-primary/40 hover:bg-background/40'>
                    <code className='font-mono text-sm break-all mr-2 text-foreground'>
                      {vault?.coinAddress}
                    </code>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='px-3 hover:bg-primary/10 transition-all duration-300 transform hover:scale-105 rounded-lg'
                      onClick={() => openExplorer(vault?.coinAddress || '')}
                    >
                      <ExternalLink className='h-4 w-4 text-primary' />
                    </Button>
                  </div>
                </div>
                
                <div className="group">
                  <h4 className='text-sm font-semibold text-foreground mb-2 flex items-center gap-2'>
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    {vault?.hodlCoinSymbol} Vault Contract
                  </h4>
                  <div className='bg-background/30 backdrop-blur-sm border border-primary/20 rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:border-primary/40 hover:bg-background/40'>
                    <code className='font-mono text-sm break-all mr-2 text-foreground'>
                      {vault?.vaultAddress}
                    </code>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='px-3 hover:bg-primary/10 transition-all duration-300 transform hover:scale-105 rounded-lg'
                      onClick={() => openExplorer(vault?.vaultAddress || '')}
                    >
                      <ExternalLink className='h-4 w-4 text-primary' />
                    </Button>
                  </div>
                </div>
                
                <div className="group">
                  <h4 className='text-sm font-semibold text-foreground mb-2 flex items-center gap-2'>
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Vault Creator
                  </h4>
                  <div className='bg-background/30 backdrop-blur-sm border border-primary/20 rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:border-primary/40 hover:bg-background/40'>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <code className='font-mono text-sm break-all text-foreground'>
                        {vaultCreator}
                      </code>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='px-3 hover:bg-primary/10 transition-all duration-300 transform hover:scale-105 rounded-lg'
                      onClick={() => openExplorer(vaultCreator)}
                    >
                      <ExternalLink className='h-4 w-4 text-primary' />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Information */}
            <div className='space-y-6'>
              <div className='flex items-center gap-3 mb-6'>
                <div className="p-2 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                  <Percent className="h-5 w-5 text-primary" />
                </div>
                <h3 className='text-xl font-bold text-gradient'>Unstaking Fees</h3>
              </div>
              
              <div className='space-y-4'>
                <div className="group">
                  <h4 className='text-sm font-semibold text-foreground mb-2 flex items-center gap-2'>
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Fee that stays in the Vault
                  </h4>
                  <div className='bg-background/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 transition-all duration-300 hover:border-purple-500/40 hover:bg-background/40'>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20">
                        <Percent className="h-4 w-4 text-purple-500" />
                      </div>
                      <span className='font-mono text-2xl font-bold text-gradient'>
                        {formatFee(vaultFee)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="group">
                  <h4 className='text-sm font-semibold text-foreground mb-2 flex items-center gap-2'>
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Fee paid to the Vault Creator
                  </h4>
                  <div className='bg-background/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 transition-all duration-300 hover:border-purple-500/40 hover:bg-background/40'>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20">
                        <User className="h-4 w-4 text-purple-500" />
                      </div>
                      <span className='font-mono text-2xl font-bold text-gradient'>
                        {formatFee(vaultCreatorFee)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="group">
                  <h4 className='text-sm font-semibold text-foreground mb-2 flex items-center gap-2'>
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    HodlCoin Protocol Fee
                  </h4>
                  <div className='bg-background/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 transition-all duration-300 hover:border-purple-500/40 hover:bg-background/40'>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20">
                        <Coins className="h-4 w-4 text-purple-500" />
                      </div>
                      <span className='font-mono text-2xl font-bold text-gradient'>
                        {formatFee(stableOrderFee)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Total Fee Summary */}
          <div className="mt-8 p-6 bg-muted/30 border border-border/40 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg border border-primary/30">
                  <Percent className="h-5 w-5 text-primary" />
                </div>
                <span className="text-lg font-semibold text-foreground">Total Unstaking Fee</span>
              </div>
              <span className="text-2xl font-mono font-bold text-foreground">
                {formatFee(vaultFee + vaultCreatorFee + stableOrderFee)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
