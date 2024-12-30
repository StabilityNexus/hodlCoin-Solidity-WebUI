import { notFound } from 'next/navigation'
import InteractionClient from './InteractionClient'

export async function generateStaticParams() {
  return [{ vaultId: ['v'] }]
}

export default function VaultPage({
  params,
}: {
  params: { vaultId: string[] }
}) {
  const [prefix, chainId, contractAddress] = params.vaultId

  if(prefix !== 'v') {
    return notFound();
  }

  return (
    <InteractionClient
      initialChainId={chainId}
      initialAddress={contractAddress}
    />
  )
}
