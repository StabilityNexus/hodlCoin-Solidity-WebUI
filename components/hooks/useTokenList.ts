import { useState, useEffect } from "react";

export interface TokenSchema {
    id?: string,
    symbol: string,
    name: string,
    image: string,
    contract_address: string
}

const tokenCache :Record<number,TokenSchema[]> ={};

const TESTNET_CHAIN_IDS = new Set([5115]);
const isTestNet = (chainId : number) => TESTNET_CHAIN_IDS.has(chainId);

const ChainIdToName: Record<string, string> = {
    137: "polygon-pos-tokens",
    1: "ethereum-tokens",
    61: "ethereum-classic-tokens",
    2001: "cardano's-milkomeda-tokens",
    5115: "citrea",
};

export function useTokenList(chainId: number) {
    const [tokens, setTokens] = useState<TokenSchema[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchTokens = async () => {
        if (tokenCache[chainId]) {
          setTokens(tokenCache[chainId]);
          return;
        }
  
        setLoading(true);
        setError(null);
  
        if (isTestNet(chainId)) {
          setError(`Please manually input the token's contract address instead.`);
          setLoading(false);
          return;
        }
  
        if (!ChainIdToName[chainId]) {
          setError(`Chain ID ${chainId} is not supported yet`);
          setLoading(false);
          return;
        }
  
        try {
          const dataUrl = `https://raw.githubusercontent.com/StabilityNexus/TokenList/main/${ChainIdToName[chainId]}.json`;
          const response = await fetch(dataUrl, {
            headers: {
              Accept: "application/json",
            },
          });
  
          if (!response.ok) {
            throw new Error(`Failed to fetch tokens: ${response.statusText}`);
          }
  
          const data = await response.json();
          tokenCache[chainId] = data;
          setTokens(data);
        } catch (error: unknown) {
          console.error("Token fetch error:", error);
          setError(error instanceof Error ? error.message : 'Failed to fetch tokens');
        } finally {
          setLoading(false);
        }
      };
  
      fetchTokens();
    }, [chainId]);
  
    return { tokens, loading, error };
  }
  