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

export default function VaultPage({ params, searchParams }: VaultPageProps) {
  const vaultId = params.vaultId
  const chainId = Number(searchParams.chainId)

  const validation = validateVaultRoute(vaultId, chainId)

  if (!validation.valid) {
    notFound()
  }

  return (
    <Suspense>
      <InteractionClient />
    </Suspense>
  )
}
