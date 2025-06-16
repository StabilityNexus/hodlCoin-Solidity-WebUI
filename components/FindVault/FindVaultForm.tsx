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
import { Search, ExternalLink } from 'lucide-react'

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
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/10">
        <AlertDialogHeader>
          <AlertDialogTitle>
            <div className='flex items-center gap-3'>
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <span className='text-gradient text-2xl font-extrabold tracking-tight'>
                Find Vault
              </span>
            </div>
          </AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className='grid gap-6 py-6'>
          <div className='grid gap-3'>
            <div className='text-sm font-semibold text-foreground flex items-center gap-2'>
              <div className="w-2 h-2 bg-primary rounded-full" />
              Chain ID
            </div>
            <Input
              id='chain-id'
              type='number'
              placeholder='e.g., 1 (Ethereum), 534351 (Scroll Sepolia)'
              value={chainId || ''}
              onChange={e => setChainId(Number(e.target.value))}
              className="bg-background/50 backdrop-blur-sm border-primary/30 focus:border-primary/60 
                transition-all duration-300 hover:border-primary/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div className='grid gap-3'>
            <div className='text-sm font-semibold text-foreground flex items-center gap-2'>
              <div className="w-2 h-2 bg-primary rounded-full" />
              Vault Address
            </div>
            <Input
              id='vault-address'
              placeholder='0x1234567890abcdef...'
              value={vaultAddress}
              onChange={e => setVaultAddress(e.target.value)}
              className="bg-background/50 backdrop-blur-sm border-primary/30 focus:border-primary/60 
                transition-all duration-300 hover:border-primary/50 text-foreground placeholder:text-muted-foreground font-mono"
            />
          </div>
          
          {vaultAddress && chainId && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="h-4 w-4" />
                <span>Ready to connect to vault on chain {chainId}</span>
              </div>
            </div>
          )}
        </div>
        
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel className="border-muted-foreground/30 hover:bg-muted/50 hover:border-muted-foreground/50 transition-all duration-300">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleContinue}
            disabled={!vaultAddress || !chainId}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary 
              transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/25
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
              text-primary-foreground font-semibold"
          >
            Connect to Vault
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
