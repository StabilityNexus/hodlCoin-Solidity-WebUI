'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

export function ModeToggle() {
  const { setTheme } = useTheme()

  function toggleDarkMode() {
    localStorage.setItem('color-scheme', 'dark')
    setTheme('dark')
  }

  function toggleLightMode() {
    localStorage.setItem('color-scheme', 'light')
    setTheme('light')
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <div className='h-full pt-[2px] relative flex flex-col w-[20px]'>
              <Sun className='absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
              <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className='grid gap-1 p-1'>
              <div
                className='px-8 cursor-pointer text-sm font-medium leading-none block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                onClick={toggleLightMode}
              >
                Light
              </div>
              <div
                className='px-8 cursor-pointer text-sm font-medium leading-none block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                onClick={toggleDarkMode}
              >
                Dark
              </div>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
