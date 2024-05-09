'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarCheck, CreditCard, TicketCheck, UserCog } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useContext, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Step0Form from './Step0'
import Step1Form from './Step1'

export default function ProfileMenu() {
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingStep0, setLoadingStep0] = useState<boolean>(false)
  const [loadingStep1, setLoadingStep1] = useState<boolean>(false)
  const [currentState, setCurrentState] = useState<string>('step0')

  const [state, setState] = useState<number>(1)

  const submitStep0 = async () => {
    try {
      setLoadingStep0(true)
      await new Promise(resolve => setTimeout(resolve, 4000))
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingStep0(false)
      setState(2)
      setCurrentState('step1')
    }
  }

  const submitStep1 = async () => {
    try {
      setLoadingStep1(true)
      await new Promise(resolve => setTimeout(resolve, 4000))
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingStep1(false)
      setState(3)
      setCurrentState('step2')
    }
  }

  return (
    <Tabs
      value={currentState}
      className='w-full flex flex-col items-center max-w-screen-2xl py-4'
    >
      <div className='w-[80%] flex flex-row gap-10 mb-24'>
        <div className='shadow-2xl border-[1px] border-secondary rounded-lg w-[250px] py-4'>
          <TabsList
            className='flex flex-col w-full p-2 space-y-2 justify-start'
            defaultValue='step0'
          >
            <TabsTrigger
              className='w-full space-x-4 px-8 justify-start data-[state=active]:text-primary'
              value='step0'
              disabled={!(state > 0)}
              onClick={() => setCurrentState('step0')}
            >
              <UserCog />
              <p>Step Zero</p>
            </TabsTrigger>
            <TabsTrigger
              className='w-full space-x-4 px-8 justify-start data-[state=active]:text-primary'
              value='step1'
              disabled={!(state > 1)}
              onClick={() => setCurrentState('step1')}
            >
              <CreditCard />
              <p>Step One</p>
            </TabsTrigger>
            <TabsTrigger
              className='w-full space-x-4 px-8 justify-start data-[state=active]:text-primary'
              value='step2'
              disabled={!(state > 2)}
              onClick={() => setCurrentState('step2')}
            >
              <CalendarCheck />
              <p>Step Two</p>
            </TabsTrigger>
            <TabsTrigger
              className='w-full space-x-4 px-8 justify-start data-[state=active]:text-primary'
              value='finalstep'
              disabled={!(state > 3)}
              onClick={() => setCurrentState('finalstep')}
            >
              <TicketCheck />
              <p>Final Step</p>
            </TabsTrigger>
          </TabsList>
        </div>
        <div className='shadow-2xl border-[1px] border-secondary rounded-lg flex-1 py-8 h-[500px]'>
          <Step0Form loading={loadingStep0} submit={submitStep0} />
          <Step1Form loading={loadingStep1} submit={submitStep1} />
        </div>
      </div>
    </Tabs>
  )
}
