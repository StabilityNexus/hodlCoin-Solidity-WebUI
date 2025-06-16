import { About } from '@/components/Home/About'
import { Hero } from '@/components/Home/Hero'

export default function Home() {
  return (
    <main className="flex-1 min-h-screen mt-8">
      <Hero />
      <About />
    </main>
  )
}
