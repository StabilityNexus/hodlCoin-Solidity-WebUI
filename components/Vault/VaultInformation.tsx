import { vaultsProps } from '@/utils/props'
import { Coins, Info, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const BLOCK_EXPLORERS: { [key: number]: string } = {
  1: 'https://etherscan.io',
  61: 'https://blockscout.com/etc/mainnet',
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

  return (
    <main className='container mx-auto p-4 mb-8'>
      <Card className='bg-white dark:bg-[#141414] border-gray-200 dark:border-gray-900 transition-colors duration-200'>
        <CardContent className='p-6'>
          <div className='flex flex-col md:flex-row gap-8'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 text-amber-600 dark:text-yellow-300 text-xl font-semibold mb-4 transition-colors duration-200'>
                <Info className='h-5 w-5' />
                Vault Information
              </div>
              <div className='space-y-4'>
                <div>
                  <h2 className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-200'>
                    {vault?.coinName} Token Contract
                  </h2>
                  <div className='bg-gray-50 dark:bg-black rounded-xl p-2 flex items-center justify-between transition-colors duration-200'>
                    <code className='font-mono text-sm break-all mr-2 text-gray-900 dark:text-white'>
                      {vault?.coinAddress}
                    </code>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='px-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200'
                      onClick={() => openExplorer(vault?.coinAddress || '')}
                    >
                      <ExternalLink className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
                <div>
                  <h2 className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-200'>
                    h{vault?.coinSymbol} Token and Vault Contract
                  </h2>
                  <div className='bg-gray-50 dark:bg-black rounded-xl p-2 flex items-center justify-between transition-colors duration-200'>
                    <code className='font-mono text-sm break-all mr-2 text-gray-900 dark:text-white'>
                      {vault?.vaultAddress}
                    </code>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='px-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200'
                      onClick={() => openExplorer(vault?.vaultAddress || '')}
                    >
                      <ExternalLink className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
                <div>
                  <h2 className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-200'>
                    Vault Creator
                  </h2>
                  <div className='bg-gray-50 dark:bg-black rounded-xl p-2 flex items-center justify-between transition-colors duration-200'>
                    <code className='font-mono text-sm break-all mr-2 text-gray-900 dark:text-white'>
                      {vaultCreator}
                    </code>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='px-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200'
                      onClick={() => openExplorer(vaultCreator)}
                    >
                      <ExternalLink className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className='hidden md:block w-px bg-gray-200 dark:bg-gray-800 transition-colors duration-200' />

            <div className='flex-1'>
              <div className='flex items-center gap-2 text-amber-600 dark:text-yellow-300 text-xl font-semibold mb-4 transition-colors duration-200'>
                <Coins className='h-5 w-5' />
                Unstaking Fees
              </div>
              <div className='space-y-4'>
                <div>
                  <h2 className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-200'>
                    Fee that stays in the Vault
                  </h2>
                  <div className='bg-gray-50 dark:bg-black rounded-xl p-3 transition-colors duration-200'>
                    <code className='font-mono text-l text-gray-900 dark:text-white'>
                      {formatFee(vaultFee)}%
                    </code>
                  </div>
                </div>
                <div>
                  <h2 className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-200'>
                    Fee paid to the Vault Creator
                  </h2>
                  <div className='bg-gray-50 dark:bg-black rounded-xl p-3 transition-colors duration-200'>
                    <code className='font-mono text-l text-gray-900 dark:text-white'>
                      {formatFee(vaultCreatorFee)}%
                    </code>
                  </div>
                </div>
                <div>
                  <h2 className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-200'>
                    hodlCoin Protocol Fee
                  </h2>
                  <div className='bg-gray-50 dark:bg-black rounded-xl p-3 transition-colors duration-200'>
                    <code className='font-mono text-l text-gray-900 dark:text-white'>
                      {formatFee(stableOrderFee)}%
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
