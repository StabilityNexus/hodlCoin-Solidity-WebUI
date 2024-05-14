'use client'

import { vaultsProps } from '@/utils/props'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { StylishButton } from '../StylishButton'
import { writeContract } from '@wagmi/core'
import { config } from '@/utils/config'
import { ERC20Abi } from '@/utils/contracts/ERC20'
import { useAccount } from 'wagmi'
import { HodlCoinAbi } from '@/utils/contracts/HodlCoin'

export default function HodlBox({
  id,
  vault,
  coinBalance,
  getBalances
}: {
  id: any
  vault: vaultsProps | null
  coinBalance: BigInt
  getBalances: Function
}) {
  const { toast } = useToast()

  const [loadingHold, setLoadingHold] = useState<boolean>(false)
  const [hodlAmount, setHodlAmount] = useState<number | null>(null);

  const [coinApproved, setCoinApproved] = useState<boolean>(false);

  const account = useAccount();

  // const conversion = (amount: number) => {
  //   return amount * (1 + (vault?.rate ?? 0))
  // }

  const hodlAction = async () => {
    try {
      setLoadingHold(true)
      if (hodlAmount === null || hodlAmount <= 0) {
        toast({
          title: 'Amount Null',
          description: 'Please input a valid amount',
        })
        setLoadingHold(false)
        return;
      }

      if(!coinApproved){
        const tx = await writeContract(config as any, {
          abi:ERC20Abi,
          // @ts-ignore
          address: vault?.coinAddress as string,
          functionName: 'approve',
          args: [vault?.address, BigInt(hodlAmount * 10**18)],
          account: account?.address as '0x${string}',
        });
        
        setCoinApproved(true);
        toast({
          title: 'Approval Done',
          description: 'You have successfully approved your tokens',
        })
      }
      else{

        const tx = await writeContract(config as any, {
          abi: HodlCoinAbi,
          // @ts-ignore
          address: vault?.address as string,
          functionName: 'hodl',
          args: [account?.address, BigInt(hodlAmount * 10**18)],
          account: account?.address as '0x${string}',
        });

        getBalances();

        toast({
          title: 'Hodl Done',
          description: 'Your hold has been successfully completed',
        })
      }
      
    } catch (error) {
      toast({
        title: 'Error',
        description: String(error),
      })
      console.error(error)
    } finally{
      setLoadingHold(false);
    }
  }

  async function getBalanceAsset(){
    try{

    } catch(err){
      console.error(err);
    }
  }

  return (
    <div className='flex-1 shadow-xl overflow-hidden border-secondary border-[1px] p-12'>
      <div className='flex flex-col space-y-4'>
        <h1 className='text-2xl font-bold pb-6'>Hodl</h1>
        <Input
          type='number'
          placeholder='Amount'
          className='w-full'
          value={hodlAmount !== null ? hodlAmount.toString() : ''}
          onChange={e => setHodlAmount(Number(e.target.value))}
        />
        <div className='flex flex-row space-x-2 px-2 pb-4 text-sm text-primary'>
          <p
          onClick={() => setHodlAmount(Number(coinBalance))}
          style={{cursor: 'pointer'}}
          >{Number(coinBalance).toString()}</p>
          <p>{vault?.coinName}</p>
        </div>
        {loadingHold ? (
          <Button className='w-full' disabled>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Please wait
          </Button>
        ) : (
          <StylishButton buttonCall={hodlAction}>{coinApproved? "hodl": `Approve ${vault?.coinName}`}</StylishButton>
        )}
      </div>
    </div>
  )
}
