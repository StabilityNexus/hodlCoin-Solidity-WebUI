import Image from 'next/image'
import Link from 'next/link'

export default function CardExplorer({
  id,
  name,
  address,
  avatar,
  supply,
  reserve,
  price,
  rate,
}: {
  id: number | string
  name: string
  address: string
  avatar: string
  supply: number
  reserve: number
  price: number
  rate: number
}) {
  return (
    <Link href={`/${address}`}>
      <div className='aspect-[6/1] shadow-xl overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105 group border-secondary border-[1px]'>
        <div className='w-full h-full flex flex-row justify-between'>
          <div className='h-full aspect-square overflow-hidden'>
            <Image
              src={avatar}
              alt=''
              className='aspect-square h-full'
              width={200}
              height={200}
            />
          </div>
          <div className='p-4 flex flex-col items-start justify-center'>
            <h3 className='text-xl font-bold text-foreground'>{name}</h3>
            <p className='text-sm text-foreground'>{address}</p>
          </div>
          <div className='py-4 px-16 flex flex-col items-start justify-center'>
            <p className='text-sm text-foreground'>Supply: {supply}</p>
            <p className='text-sm text-foreground'>Reserve: {reserve}</p>
            <p className='text-sm text-foreground'>Price: {price}</p>
            <p className='text-sm text-foreground'>Rate: {rate}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
