import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import InteractionClient from './InteractionClient'
import { validateVaultRoute } from '@/utils/validation'

interface VaultPageProps {
  params: {
    vaultId: string
  }
  searchParams: {
    chainId?: string
  }
}

/**
 * Vault detail page.
 * Performs server-side validation of vault address and chain ID
 * before rendering the client-side interaction component.
 */
export default function VaultPage({ params, searchParams }: VaultPageProps) {
  const vaultId = params.vaultId
  const chainId = Number(searchParams.chainId)

  const validation = validateVaultRoute(vaultId, chainId)

  if (!validation.valid) {
    notFound()
  }

  return (
    <Suspense>
      <InteractionClient vaultId={vaultId as `0x${string}`} chainId={chainId} />
    </Suspense>
  )
}
