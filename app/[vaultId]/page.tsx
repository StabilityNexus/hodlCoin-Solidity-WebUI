'use client'

import ActionsVault from '@/components/Vault/Actions'
import HeroVault from '@/components/Vault/HeroVault'

// @ts-ignore
export default function VaultPage({ params: { vaultId } }) {
  return (
    <div className='w-full pt-32'>
      <div className='w-full md:px-24 lg:px-24 mb-12'>
        <HeroVault id={vaultId} />
        <ActionsVault id={vaultId} />
      </div>
    </div>
  )
}
