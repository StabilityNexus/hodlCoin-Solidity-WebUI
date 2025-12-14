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
import { validateVaultRoute } from '@/utils/validation'

interface PromptDialogBoxProps {
  children: React.ReactNode
}

export default function FindVault({ children }: PromptDialogBoxProps) {
  const router = useRouter()

  const [vaultAddress, setVaultAddress] = useState('')
  const [chainId, setChainId] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  const handleContinue = () => {
    const numericChainId = Number(chainId)

    const validation = validateVaultRoute(vaultAddress, numericChainId)

    if (!validation.valid) {
      setError(validation.error ?? 'Invalid input')
      return
    }

    setError(null)

    // ✅ Canonical, valid route
    router.push(`/${vaultAddress}?chainId=${numericChainId}`)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/10">
        <AlertDialogHeader>
          <AlertDialogTitle>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <span className="text-gradient text-2xl font-extrabold tracking-tight">
                Find Vault
              </span>
            </div>
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="grid gap-6 py-6">
          <div className="grid gap-3">
            <div className="text-sm font-semibold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              Chain ID
            </div>
            <Input
              type="number"
              placeholder="e.g., 1 (Ethereum), 534351 (Scroll Sepolia)"
              value={chainId}
              onChange={e =>
                setChainId(e.target.value ? Number(e.target.value) : '')
              }
              className="bg-background/50 backdrop-blur-sm border-primary/30"
            />
          </div>

          <div className="grid gap-3">
            <div className="text-sm font-semibold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              Vault Address
            </div>
            <Input
              placeholder="0x1234567890abcdef..."
              value={vaultAddress}
              onChange={e => setVaultAddress(e.target.value.trim())}
              className="bg-background/50 backdrop-blur-sm border-primary/30 font-mono"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-500">
              {error}
            </div>
          )}

          {!error && vaultAddress && chainId && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="h-4 w-4" />
                <span>Ready to connect to vault on chain {chainId}</span>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleContinue}
            disabled={!vaultAddress || !chainId}
          >
            Connect to Vault
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
