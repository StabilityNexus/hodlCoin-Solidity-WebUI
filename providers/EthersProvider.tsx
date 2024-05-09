'use client'

import React, { createContext } from 'react'
import MetamaskContext from '@/contexts/EthersContext'
import { connectMetamask } from '@/utils/connectMetamask'

export default function MetamaskProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [account, setAccount] = React.useState<string | null>(null)
  // const [provider, setProvider] = React.useState<any>(null);
  const [signer, setSigner] = React.useState<any>(null)

  React.useEffect(() => {
    if ((window as any).ethereum) {
      //check if Metamask wallet is installed
      // setIsMetamaskInstalled(true);
      setAccount((window as any).ethereum.selectedAddress)
    }
  }, [])

  async function connectWallet(): Promise<void> {
    const connection = await connectMetamask()
    setAccount(connection?.address)
    // setProvider(connection?.web3Provider);
    setSigner(connection?.web3Signer)
  }

  const metamaskValues = {
    account,
    setAccount,
    signer,
    setSigner,
    connectWallet,
  }

  return (
    <MetamaskContext.Provider value={metamaskValues}>
      {children}
    </MetamaskContext.Provider>
  )
}
