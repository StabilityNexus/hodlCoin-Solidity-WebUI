import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/Header'
import Footer from '@/components/Footer'
import { WalletProvider } from '@/providers/WalletProvider'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
  fallback: ['system-ui', 'arial', 'sans-serif']
})

export const metadata: Metadata = {
  title: 'hodlCoin Staking Platform',
  description: 'Self-Stabilizing Staking vaults where the price is mathematically proven to always increase! Unstaking fees benefit vault creators and those who keep staking longer.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      {/* Fonts are now loaded exclusively through `next/font` */}
      <body className={poppins.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
              <Header />
              <main className="flex-1 w-full">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
