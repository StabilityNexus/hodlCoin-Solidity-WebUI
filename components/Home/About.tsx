'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '../ui/card'
import { useMatrixEffect } from '../hooks/useMatrixEffect'

export function About() {
  const matrixRef = useMatrixEffect(0.25, 3) // Reduced opacity and symbol count

  return (
    <section className="relative w-full py-24 overflow-hidden bg-background">
      {/* Matrix background effect */}
      <div className="absolute inset-0 opacity-25">
        <div ref={matrixRef} className="absolute inset-0 w-full h-full" />
        
        {/* Additional purple glow effects */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gray-300/15 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gray-400/10 dark:bg-violet-500/15 rounded-full blur-2xl animate-pulse animation-delay-2000" />
          <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-gray-500/5 dark:bg-fuchsia-500/10 rounded-full blur-xl animate-pulse animation-delay-4000" />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
      </div>

      

      <div className="relative container mx-auto px-4 space-y-24">

        {/* How HodlCoin Works Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
          {/* Paper Image */}
          <div className="w-full lg:w-1/2">
            <Card className="p-4 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
              <Link
                href='https://eprint.iacr.org/2023/1029'
                target='_blank'
                className="block group"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    unoptimized
                    fetchPriority='high'
                    loading='lazy'
                    src='/images/paper.png'
                    alt='Research Paper'
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </Card>
          </div>

          {/* Content */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gradient">
                How hodlCoin Works
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-purple-500 dark:from-purple-400 dark:to-fuchsia-500 rounded-full" />
            </div>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground font-medium">
                HodlCoin is a staking protocol that encourages staking (&quot;hodling&quot;)
                assets for long periods of time. When hodling, users deposit coins of
                a given asset in a vault and receive a proportional amount of corresponding hodlCoins.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground font-medium">
                When unhodling, users must pay an unstaking fee that benefits the vault&apos;s creator and users
                who continue hodling longer. Moreover, anyone (especially vault creators) can 
                distribute rewards to hodlers, to further incentivize hodling.
              </p>
            </div>

            <div className="pt-4">
              <Link 
                href='https://eprint.iacr.org/2023/1029'
                target='_blank'
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Read the Research Paper
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        
        {/* Why HodlCoin Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gradient">
              Why hodlCoin
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Vault Creators */}
            <Card className="p-8 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gradient">For Vault Creators</h3>
                  <div className="h-0.5 w-12 bg-gradient-to-r from-primary to-purple-500 rounded-full" />
                </div>
                
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gradient">Reward your Loyal Tokenholders</h4>
                      <p className="text-sm text-muted-foreground">Efficiently distribute rewards to all your tokenholders with a single transaction.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gradient">Signal your Long-Term Commitment</h4>
                      <p className="text-sm text-muted-foreground">Stake your own tokens in a vault with a high unstaking fee, to show your community that you are holding for the long run.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gradient">Earn Unstaking Fees</h4>
                      <p className="text-sm text-muted-foreground">Receive a portion of fees when users unstake early.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gradient">Protect your Token from Sell Pressure</h4>
                      <p className="text-sm text-muted-foreground">The unstaking fee disincentivizes sellers and incentivizes holders without inflation.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </Card>

            {/* For Stakers */}
            <Card className="p-8 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gradient">For Stakers</h3>
                  <div className="h-0.5 w-12 bg-gradient-to-r from-primary to-purple-500 rounded-full" />
                </div>
                
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gradient">Earn from Others&apos; Impatience</h4>
                      <p className="text-sm text-muted-foreground">Benefit from unstaking fees paid by users who exit early.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gradient">Long-Term Value Growth</h4>
                      <p className="text-sm text-muted-foreground">The price of the hodlCoin is mathematically guaranteed to grow w.r.t. the price of the underlying coin, if you hodl longer than others.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gradient">Receive Rewards</h4>
                      <p className="text-sm text-muted-foreground">Get additional rewards distributed by vault creators who want to incentivize staking.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gradient">Flexible Participation</h4>
                      <p className="text-sm text-muted-foreground">Stake and unstake at any time, choosing from a wide variety of vaults for various tokens.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>


        
      </div>
    </section>
  )
}
