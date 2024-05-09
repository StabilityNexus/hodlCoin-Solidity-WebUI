import ExplorerVaults from '@/components/Explorer/ExplorerVaults'

export default function ExplorerPage() {
  return (
    <div className='w-full'>
      <div className='w-full h-48 bg-blue-200'>
        <div className='flex flex-col items-center justify-end py-4 h-full space-y-6'>
          <h1>Vaults:</h1>
        </div>
      </div>
      <div className='w-full flex justify-center oveflow-x-hidden'>
        <ExplorerVaults />
      </div>
    </div>
  )
}
