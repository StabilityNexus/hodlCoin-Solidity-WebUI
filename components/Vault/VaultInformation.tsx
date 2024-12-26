import { vaultsProps } from '@/utils/props'
import { Coins, Info, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
  const openExplorer = (address: string) => {
    window.open(`https://sepolia.scrollscan.com/address/${address}`, '_blank')
  }

  const formatFee = (fee: number) => {
    return (fee / 1000)
  }

  return (
    <main className='container mx-auto p-4 mb-8'>
      <Card className='bg-[#141414] border-gray-900'>
        <CardContent className='p-6'>
          <div className='flex flex-col md:flex-row gap-8'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 text-yellow-500 text-xl font-semibold mb-4'>
                <Info className='h-5 w-5' />
                Vault Information
              </div>
              <div className='space-y-4'>
                <div>
                  <h2 className='text-sm font-medium text-gray-400 mb-1'>
                    {vault?.coinName} Token Contract
                  </h2>
                  <div className='bg-black rounded-xl p-2 flex items-center justify-between'>
                    <code className='font-mono text-sm break-all mr-2'>
                      {vault?.coinAddress}
                    </code>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='px-2 hover:bg-gray-800'
                      onClick={() => openExplorer(vault?.coinAddress || '')}
                    >
                      <ExternalLink className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
                <div>
                  <h2 className='text-sm font-medium text-gray-400 mb-1'>
                    h{vault?.coinSymbol} Token and Vault Contract
                  </h2>
                  <div className='bg-black rounded-xl p-2 flex items-center justify-between'>
                    <code className='font-mono text-sm break-all mr-2'>
                      {vault?.vaultAddress}
                    </code>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='px-2 hover:bg-gray-800'
                      onClick={() => openExplorer(vault?.vaultAddress || '')}
                    >
                      <ExternalLink className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
                <div>
                  <h2 className='text-sm font-medium text-gray-400 mb-1'>
                    Vault Creator
                  </h2>
                  <div className='bg-black rounded-xl p-2 flex items-center justify-between'>
                    <code className='font-mono text-sm break-all mr-2'>
                      {vaultCreator}
                    </code>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='px-2 hover:bg-gray-800'
                      onClick={() => openExplorer(vaultCreator)}
                    >
                      <ExternalLink className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className='hidden md:block w-px bg-gray-800' />

            <div className='flex-1'>
              <div className='flex items-center gap-2 text-yellow-500 text-xl font-semibold mb-4'>
                <Coins className='h-5 w-5' />
                Unstaking Fees
              </div>
              <div className='space-y-4'>
                <div>
                  <h2 className='text-sm font-medium text-gray-400 mb-2'>
                    Fee that stays in the Vault
                  </h2>
                  <div className='bg-black rounded-xl p-3'>
                    <code className='font-mono text-l'>
                      {formatFee(vaultFee)}%
                    </code>
                  </div>
                </div>
                <div>
                  <h2 className='text-sm font-medium text-gray-400 mb-2'>
                    Fee paid to the Vault Creator
                  </h2>
                  <div className='bg-black rounded-xl p-3'>
                    <code className='font-mono text-l'>
                      {formatFee(vaultCreatorFee)}%
                    </code>
                  </div>
                </div>
                <div>
                  <h2 className='text-sm font-medium text-gray-400 mb-2'>
                    hodlCoin Protocol Fee
                  </h2>
                  <div className='bg-black rounded-xl p-3'>
                    <code className='font-mono text-l'>
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
