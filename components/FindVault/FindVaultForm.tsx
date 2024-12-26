'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'

interface PromptDialogBoxProps {
  children: React.ReactNode
}

export default function FindVault({ children }: PromptDialogBoxProps) {
  const router = useRouter()
  const [vaultAddress, setVaultAddress] = useState('')
  const [chainId, setChainId] = useState<number>(0)

  const handleContinue = () => {
    if (vaultAddress && chainId) {
      router.push(`/v?chainId=${chainId}&vault=${vaultAddress}`)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>{children}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <div className='text-yellow-400 text-2xl'>Enter Hodlcoin Details</div>
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <div className='text-m font-medium text-gray-200'>
              Enter the Chain ID
            </div>
            <Input
              id='chain-id'
              type='number'
              placeholder='123456'
              value={chainId || ''}
              onChange={e => setChainId(Number(e.target.value))}
            />
          </div>
          <div className='grid gap-2'>
            <div className='text-sm font-medium text-gray-200'>
              Enter the Vault Address
            </div>
            <Input
              id='vault-address'
              placeholder='0xABCD1234'
              value={vaultAddress}
              onChange={e => setVaultAddress(e.target.value)}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleContinue}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
