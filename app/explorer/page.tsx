import ExplorerVaults from '@/components/Explorer/ExplorerVaults'

export default function ExplorerPage() {

  return (
    <div className="relative mt-12 min-h-screen w-full bg-background">

      {/* Full width content */}
      <div className="relative w-full">
        <ExplorerVaults />
      </div>
    </div>
  )
}