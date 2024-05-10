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
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
// import Pic from '../assets/logo_white.png'
// import Image from 'next/image'

const components: { title: string; href: string; description: string }[] = [
  {
    title: 'createVault',
    href: '/createVault',
    description: 'Rota para criar o vault',
  },
  {
    title: 'explorer',
    href: '/explorer',
    description: 'Rota para ver vaults',
  },
]

export function NavBar() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* <NavigationMenuItem>
          <NavigationMenuTrigger className='hover:text-primary'>
            Getting started
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className='grid gap-2 p-3 md:w-[300px] lg:w-[400px] lg:grid-cols-[.75fr_1fr]'>
              <li className='row-span-3'>
                <NavigationMenuLink asChild>
                  <Link href='/'>
                    <div className='flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-[#6c18d0] to-[#8028c3] p-6 no-underline outline-none focus:shadow-md'>
                      <div className='mb-2 mt-4 text-lg font-bold text-white'>
                        HodlCoin
                      </div>
                      <p className='text-sm leading-tight text-white font-light'>
                        xxx
                      </p>
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem href='/' title='X'>
                xxx
              </ListItem>
              <ListItem href='/' title='X'>
                xxx
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem> */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className='hover:text-foreground'>
            TEST ROUTES
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className='grid gap-2 p-3 md:w-[250px] lg:w-[300px]'>
              {components.map(component => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
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
