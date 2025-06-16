import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/Header'
import Footer from '@/components/Footer'
import { WalletProvider } from '@/providers/WalletProvider'
import { WagmiProvider } from '@/providers/wagmi-provider'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

export const metadata: Metadata = {
  title: 'HodlCoin',
  description: 'Stake your tokens and earn rewards',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WagmiProvider>
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
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
