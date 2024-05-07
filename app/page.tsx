import { About } from '@/components/Home/About'
import { Hero } from '@/components/Home/Hero'

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center overflow-x-hidden w-full'>
      <Hero />
      <About />
    </main>
  )
}
