import { ToastWithTitle } from '@/components/toast-button'

export default function Createvault() {
  return (
    <div className='w-[100vw]'>
      <div className='w-full h-96 bg-blue-200'>
        <div className='flex flex-col items-center justify-center h-full space-y-6'>
          <h1>Hello, createVault page!</h1>
          <ToastWithTitle />
        </div>
      </div>
    </div>
  )
}
