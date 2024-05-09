import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function Step1Form({
  loading,
  submit,
}: {
  loading: boolean
  submit: () => void
}) {
  return (
    <TabsContent value='step1'>
      <h1 className='px-12 text-xl font-bold text-primary'>Step1 Info</h1>
      <div className='px-12 pt-4'>
        <CardDescription className='mt-8'>
          <Input type='text' placeholder='DHIJASBVDA' className='w-full' />
          {loading ? (
            <Button className='w-full mt-4' disabled>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Loading...
            </Button>
          ) : (
            <Button className='w-full mt-4' onClick={submit}>
              Save
            </Button>
          )}
        </CardDescription>
      </div>
    </TabsContent>
  )
}
