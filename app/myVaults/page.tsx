import  VaultDashboard  from '../../components/MyVaults/AllVaults'

export default function Home() {
  return (
    <div className='w-full pt-6 bg-gray-50 dark:bg-black'>
      <main className='flex min-h-screen flex-col items-center overflow-x-hidden w-full'>
        <VaultDashboard />
      </main>
    </div>
  )
}
