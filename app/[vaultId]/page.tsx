import InteractionClient from './InteractionClient'

export async function generateStaticParams() {
  return [
    { vaultId: 'vaultId' },
  ]
}

// @ts-ignore
export default function VaultPage() {
  return (
    <InteractionClient />
  )
}

