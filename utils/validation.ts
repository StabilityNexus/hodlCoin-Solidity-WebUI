import { isAddress } from 'viem'

export const SUPPORTED_CHAIN_IDS = [1, 5, 11155111, 137] // adjust as needed

export function validateVaultAddress(address: string): boolean {
  return isAddress(address)
}

export function validateChainId(chainId: number): boolean {
  return SUPPORTED_CHAIN_IDS.includes(chainId)
}

export function validateVaultRoute(
  address?: string,
  chainId?: number
): { valid: boolean; error?: string } {
  if (!address || !validateVaultAddress(address)) {
    return { valid: false, error: 'Invalid vault address' }
  }

  if (!chainId || !validateChainId(chainId)) {
    return { valid: false, error: 'Unsupported chain' }
  }

  return { valid: true }
}
