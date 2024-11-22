import ActionsVault from '@/components/Vault/Actions'
import HeroVault from '@/components/Vault/HeroVault'
import GetData from "./GetData";


export async function generateStaticParams() {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/vaults')
    const data = await response.json()

    return data.vaults.map((vault: any) => ({
      vaultId: vault.address,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}


// @ts-ignore
export default function VaultPage({ params: { vaultId } }) {

  const {
    vault,
    priceHodl,
    coinReserve,
    hodlCoinSupply,
    devFee,
    vaultCreatorFee,
    reserveFee,
    getBalances,
    coinBalance,
    hodlCoinBalance,
  } = GetData(vaultId)
  
  return (
    <div className='w-full pt-32'>
      <div className='w-full md:px-24 lg:px-24 mb-12'>
        <HeroVault
          vault={vault}
          priceHodl={priceHodl}
          reserve={coinReserve}
          supply={hodlCoinSupply}
          devFee={devFee}
          vaultCreatorFee={vaultCreatorFee}
          reserveFee={reserveFee}
        />
        <ActionsVault
          getBalances={getBalances}
          coinBalance={coinBalance}
          hodlCoinBalance={hodlCoinBalance}
          vault={vault}
        />
      </div>
    </div>
  )
}
