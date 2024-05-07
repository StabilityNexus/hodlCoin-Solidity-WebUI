import ExplorerVaults from '@/components/Explorer/ExplorerVaults'

export default function ExplorerPage() {
  return (
    <div className='w-[100vw]'>
      <div className='w-full h-48 bg-blue-200'>
        <div className='flex flex-col items-center justify-end py-4 h-full space-y-6'>
          <h1>Vaults:</h1>
        </div>
        <div className='w-full flex justify-center'>
          <ExplorerVaults />
        </div>
      </div>
    </div>
  )
}
