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
import { useRouter } from 'next/navigation'
import { validateVaultRoute } from '@/utils/validation'

interface Props {
  children: React.ReactNode
}

/**
 * Dialog form allowing users to navigate to a vault
 * by entering a vault address and chain ID.
 */
export default function FindVault({ children }: Props) {
  const router = useRouter()
  const [vaultAddress, setVaultAddress] = useState('')
  const [chainId, setChainId] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  const handleContinue = () => {
    const validation = validateVaultRoute(
      vaultAddress,
      Number(chainId)
    )

    if (!validation.valid) {
      setError(validation.error!)
      return
    }

    router.push(`/${vaultAddress}?chainId=${chainId}`)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Find Vault</AlertDialogTitle>
        </AlertDialogHeader>

        <Input
          placeholder="Chain ID"
          type="number"
          value={chainId}
          onChange={e =>
            setChainId(e.target.value ? Number(e.target.value) : '')
          }
        />

        <Input
          placeholder="Vault Address"
          value={vaultAddress}
          onChange={e => setVaultAddress(e.target.value.trim())}
        />

        {error && <p className="text-red-500">{error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleContinue}>
            Connect
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
