import ExplorerVaults from '@/components/Explorer/ExplorerVaults'
import { Input } from '@/components/ui/input'

export default function ExplorerPage() {
 
  return (
    <main className='container mx-auto px-4 py-8'>
      <div className='w-full'>
        <div className='flex justify-between items-center pt-14 mb-8'>
          <h2 className='text-2xl font-bold text-yellow-400'>Vaults Explorer</h2>
          <div className='w-64'>
            <div className='relative'>
              <Input
                placeholder='Search Vaults'
                className='pl-8 bg-muted/50 border-none'
              />
            </div>
          </div>
        </div>
        <div className='w-full flex justify-center pb-[20vh] oveflow-x-hidden'>
          <ExplorerVaults />
        </div>
      </div>
    </main>
  )
}
