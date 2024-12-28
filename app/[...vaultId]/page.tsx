import { notFound } from 'next/navigation'
import InteractionClient from './InteractionClient'

export async function generateStaticParams() {
  return [{ vaultId: ['vaultId'] }]
}

// @ts-ignore
export default function VaultPage({
  params,
}: {
  params: {
    vaultId: string[]
  }
}) {
  
  const [prefix, chainId, contractAddress] = params.vaultId
  
  if (prefix !== 'v') {
    return notFound()
  }
  console.log(chainId, contractAddress);
  return (
    <InteractionClient
      initialChainId={chainId}
      initialAddress={contractAddress}
    />
  )
}
