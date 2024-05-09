import CreateForm from '@/components/CreateVault/CreateForm'

export default function Createvault() {
  return (
    <div className='w-full'>
      <div className='w-full h-36 bg-blue-200'>
        <div className='flex flex-col items-center justify-end h-full space-y-6 py-6'>
          <h1>Hello, createVault page!</h1>
        </div>
      </div>
      <CreateForm />
    </div>
  )
}
