'use client'

import { vaultsData } from '@/utils/mock'
import { vaultsProps } from '@/utils/props'
import { useEffect, useState } from 'react'
import HodlBox from './HodlBox'
import UnholdBox from './Unhodl'

export default function ActionsVault({ id }: { id: number }) {
  const [loading, setLoading] = useState<boolean>(false)

  const [vault, setVault] = useState<vaultsProps | null>(null)

  const getVaultsData = async () => {
    try {
      setLoading(true)
      setVault(vaultsData[id - 1])
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getVaultsData()
  })

  return (
    <div className='w-full flex flex-col items-center justify-center'>
      {vault && (
        <div className='w-full max-w-screen-2xl py-12 grid grid-cols-1 lg:grid-cols-2 gap-12'>
          <HodlBox id={id} vault={vault} />
          <UnholdBox id={id} vault={vault} />
        </div>
      )}
    </div>
  )
}
