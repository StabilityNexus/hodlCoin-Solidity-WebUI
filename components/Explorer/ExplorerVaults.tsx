'use client'

import { useEffect, useState } from 'react'
import { vaultsData } from '@/utils/mock'
import { vaultsProps } from '@/utils/props'
import CardExplorer from './CardExplorer'

export default function ExplorerVaults() {
  const [loading, setLoading] = useState<boolean>(false)

  const [vaults, setVaults] = useState<vaultsProps[]>([])

  const getVaultsData = async () => {

    try {
      setLoading(true);

      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }

      const url = process.env.NEXT_PUBLIC_API_URL + '/vaults';
      const response = await fetch(url, options);
      const data = await response.json();

      setVaults(data.vaults);

      console.log(data.vaults);
    } catch (error) {
      console.error(error)
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if(vaults.length > 0) return;

    getVaultsData()
  }, [])

  return (
    <div className='w-full max-w-screen-2xl'>
      <div className='p-6 w-full md:px-24 lg:px-24 mb-24'>
        <div className='w-full grid grid-cols-2 gap-6'>
          {vaults.map((vault, index) => {
            return (
              <div key={index}>
                <CardExplorer
                  id={vault.id}
                  name={vault.name}
                  address={vault.address}
                  avatar={'/images/avatar1.jpeg'}
                  supply={vault.supply}
                  reserve={vault.reserve}
                  price={vault.price}
                  rate={vault.rate}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
