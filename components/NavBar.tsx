'use client'

import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
// import Pic from '../assets/logo_white.png'
// import Image from 'next/image'

const components: { title: string; href: string; description: string }[] = [
  {
    title: 'Create Vault',
    href: '/createVault',
    description: 'Your own new vault',
  },
  {
    title: 'Explorer',
    href: '/explorer',
    description: 'All vaults',
  },
  {
    title: 'My Vaults',
    href: '/myVaults',
    description: 'Vaults you have created',
  },
  {
    title: 'Favorite Vaults',
    href: '/favorites',
    description: 'Vaults you have interacted with',
  },
]

export function NavBar() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className='hover:text-foreground'>
            Staking Vaults
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className='grid gap-2 p-3 md:w-[250px] lg:w-[300px]'>
              {components.map(item => (
                <ListItem key={item.title} title={item.title} href={item.href}>
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {/* <NavigationMenuItem>
          <Link href='/' legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <p className='hover:text-primary'>X</p>
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem> */}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        {/* @ts-ignore */}
        <Link href={props.href}>
          {/* @ts-ignore */}
          <div
            className={cn(
              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              className,
            )}
            {...props}
          >
            <div className='text-sm font-medium leading-none'>{title}</div>
            <p className='line-clamp-3 text-sm leading-snug text-muted-foreground'>
              {children}
            </p>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'
