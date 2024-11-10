import ExplorerVaults from '@/components/Explorer/ExplorerVaults'
import { redirect } from 'next/navigation'

export default function ExplorerPage() {

  const isPageDisabled = true; // Set this flag to disable the page

  if (isPageDisabled) {
    redirect('/');
  }

  return (
    <div className='w-full'>
      <div className='w-full h-36'>
        <div className='flex flex-col items-center justify-end py-4 h-full space-y-6'>
          <h1 className='text-primary font-bold text-xl'>Vaults</h1>
        </div>
      </div>
      <div className='w-full flex justify-center pb-[20vh] oveflow-x-hidden'>
        <ExplorerVaults />
      </div>
    </div>
  )
}
