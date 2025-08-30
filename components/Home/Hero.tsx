'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '../ui/button'
import { Player } from '@lottiefiles/react-lottie-player'
import FindVault from '../FindVault/FindVaultForm'
import { useMatrixEffect } from '../hooks/useMatrixEffect'

export function Hero() {
  const matrixRef = useMatrixEffect(0.2, 2) // Even more subtle for hero section

  return (
    <div className="relative w-full min-h-[90vh] mt-4 overflow-hidden flex flex-col items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90" />
      
      {/* Matrix background effect */}
      <div className="absolute inset-0 opacity-20">
        <div ref={matrixRef} className="absolute inset-0 w-full h-full" />
        
        {/* Additional purple glow effects */}
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-gray-300/10 dark:bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-gray-400/10 dark:bg-violet-500/12 rounded-full blur-2xl animate-pulse animation-delay-2000" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gray-500/5 dark:bg-fuchsia-500/8 rounded-full blur-xl animate-pulse animation-delay-4000" />
        
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/10 via-transparent to-background/5" />
      </div>

      <div className="relative flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 py-16 space-y-8">
        {/* Logo Animation */}
        <div className="relative w-32 h-32 animate-float">
          <Player
            autoplay
            loop
            src='/animations/coin_animation.json'
            className="w-full h-full"
          />
        </div>

        {/* Main Content */}
        <div className="text-center space-y-6">
          <h1 className="pb-2 text-5xl md:text-6xl font-extrabold tracking-tight text-gradient animate-fade-in">
            hodlCoin Staking Platform
          </h1>
          <p className="text-lg md:text-lg text-muted-foreground font-medium leading-relaxed animate-slide-in">
            Self-Stabilizing Staking vaults where the price is mathematically proven to always increase! <br />
            Unstaking fees benefit vault creators and those who keep staking longer.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 animate-fade-in">
          <Link href='/createVault'>
            <Button 
              size="lg" 
              className="w-full md:w-auto font-bold relative overflow-hidden group
                bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary
                transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/25
                border-0 text-primary-foreground"
            >
              <span className="relative z-10">Create a Vault</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            </Button>
          </Link>
          <Link href='/myVaults'>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full md:w-auto font-bold relative overflow-hidden group
                border-2 border-primary/50 hover:border-primary bg-background/50 backdrop-blur-sm
                hover:bg-primary/10 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-primary/20
                text-foreground hover:text-primary"
            >
              <span className="relative z-10">View your Vaults</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </Button>
          </Link>
          <FindVault>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full md:w-auto font-bold relative overflow-hidden group
                bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary
                transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/25
                border-0 text-primary-foreground"
            >
              <span className="relative text-white z-10">Use a Vault</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            </Button>
          </FindVault>
        </div>
      </div>
    </div>
  )
}
