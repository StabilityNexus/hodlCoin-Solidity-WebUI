'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'

interface PromptDialogBoxProps {
  children: React.ReactNode;
}

export default function PromptDialogBox({ children }: PromptDialogBoxProps) {
  const [contractAddress, setContractAddress] = useState('')
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleContinue = () => {
    if (contractAddress) {
      router.push(`/address#${contractAddress}`)
    }
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>{children}</Button>
        </AlertDialogTrigger>
        {isClient && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Enter Hodlcoin Contract Address
              </AlertDialogTitle>
              <AlertDialogDescription>
                Please enter the contract address of the hodlcoin
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              placeholder='0xABCD1234'
              value={contractAddress}
              onChange={e => setContractAddress(e.target.value)}
              className='my-2'
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleContinue}>
                  Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </>
  )
}
