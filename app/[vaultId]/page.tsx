import InteractionClient from './InteractionClient'

export async function generateStaticParams() {
  return [
    { vault: 'vault' },
    { chianId: 123},
  ]
}

// @ts-ignore
export default function VaultPage() {
  return (
    <InteractionClient />
  )
}

