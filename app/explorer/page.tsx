'use client'

import ExplorerVaults from '@/components/Explorer/ExplorerVaults'
import { Button } from '@/components/ui/button'
import { PlusCircle, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ExplorerPage() {
  const router = useRouter()

  const handleCreateVault = () => {
    router.push('/createVault')
  }

  const handleYourVault = () => {
    router.push('/myVaults')
  }

  return (
    <div className='w-full pt-6 bg-gray-50 dark:bg-black'>
      <main className='container mx-auto px-4 py-8'>
        <div className='w-full'>
          <div className='flex justify-between items-center pt-14 mb-6'>
            <div className='mb-8'>
              <div className='flex items-center gap-3 mb-4'>
                <h1 className='text-4xl font-extrabold tracking-tight dark:text-gray-200 text-gray-900'>
                  Vault Archive
                </h1>
              </div>
              <p className='dark:text-purple-50 text-gray-900 text-lg pl-1'>
                Welcome to the central repository for accessing all previous
                vaults on various chains.
              </p>
            </div>
          </div>

          <div className='mb-12'>
            <h2 className='dark:text-yellow-400 text-gray-900 font-bold mb-4 text-xl font-large'>
              Quick Links:
            </h2>
            <div className='grid md:grid-cols-6 gap-4'>
              <Button
                variant='outline'
                className='flex gap-3 h-auto p-4 dark:bg-zinc-900 bg-white
              dark:hover:border-purple-500 hover:border-yellow-400
              duration-200'
              onClick={handleYourVault}
              >
                <Wallet className='h-5 w-5 dark:text-purple-400 text-purple-600' />
                <div className='text-left'>
                  <div className='font-semibold dark:text-white text-gray-900'>
                    Your Vaults
                  </div>
                  <div className='text-sm dark:text-white text-gray-900'>
                    View your active vaults
                  </div>
                </div>
              </Button>

              <Button
                variant='outline'
                className='flex gap-3 h-auto p-4 dark:bg-zinc-900 bg-white
              dark:hover:border-purple-500 hover:border-yellow-400
              duration-200'
                onClick={handleCreateVault}
              >
                <PlusCircle className='h-5 w-5 dark:text-purple-400 text-purple-600' />
                <div className='text-left'>
                  <div className='font-semibold dark:text-white text-gray-900'>
                    Create Vault
                  </div>
                  <div className='text-sm dark:text-white text-gray-900'>
                    Create your new vault
                  </div>
                </div>
              </Button>
            </div>
          </div>
          <div className='w-full flex justify-center pb-[20vh] overflow-x-hidden'>
            <ExplorerVaults />
          </div>
        </div>
      </main>
    </div>
  )
}