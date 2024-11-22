import InteractionClient from './InteractionClient'


export async function generateStaticParams() {
  return [
    { vaultId: 'vaultId' }, // This should be a string, not an array
  ]
}

// @ts-ignore
export default function VaultPage({ params: { vaultId } }) {
  const deploymentId = vaultId // Direct use of vaultId
  return <InteractionClient initialVaultId={deploymentId} />
}