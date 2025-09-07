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
  metadataBase: new URL('https://hodlcoin.vercel.app'),
  title: 'hodlCoin - Self-Stabilizing Staking Platform',
  description: 'Create and stake in self-stabilizing vaults where the price is mathematically proven to always increase. Unstaking fees benefit vault creators and long-term stakers.',
  keywords: 'staking, cryptocurrency, blockchain, hodl, vault, defi, ethereum, rewards',
  authors: [{ name: 'hodlCoin Team' }],
  creator: 'hodlCoin',
  publisher: 'hodlCoin',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hodlcoin.vercel.app',
    title: 'hodlCoin - Self-Stabilizing Staking Platform',
    description: 'Create and stake in self-stabilizing vaults where the price is mathematically proven to always increase. Unstaking fees benefit vault creators and long-term stakers.',
    siteName: 'hodlCoin',
    images: [
      {
        url: '/hodlcoin.png',
        width: 1200,
        height: 630,
        alt: 'hodlCoin - Self-Stabilizing Staking Platform',
        type: 'image/png',
      },
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'hodlCoin Logo',
        type: 'image/png',
      }
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@hodlcoin',
    creator: '@hodlcoin',
    title: 'hodlCoin - Self-Stabilizing Staking Platform',
    description: 'Create and stake in self-stabilizing vaults where the price is mathematically proven to always increase.',
    images: ['/hodlcoin.png'],
  },

  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Manifest and icons
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
  
  // App specific
  applicationName: 'hodlCoin',
  category: 'finance',
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
