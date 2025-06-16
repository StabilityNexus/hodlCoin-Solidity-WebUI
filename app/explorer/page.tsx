'use client'

import ExplorerVaults from '@/components/Explorer/ExplorerVaults'
import { Button } from '@/components/ui/button'
import { PlusCircle, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'

export default function ExplorerPage() {
  const router = useRouter()

  const handleCreateVault = () => {
    router.push('/createVault')
  }

  const handleYourVault = () => {
    router.push('/myVaults')
  }

  return (
    <div className="relative mt-12 min-h-screen w-full">
      {/* Background Elements - Full width */}
      <div className="absolute inset-0 w-full">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      {/* Full width content */}
      <div className="relative w-full">
        <ExplorerVaults />
      </div>
    </div>
  )
}