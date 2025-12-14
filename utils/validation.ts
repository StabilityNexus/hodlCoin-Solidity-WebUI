import { isAddress } from 'viem'

/**
 * List of blockchain chain IDs supported by the application.
 */
export const SUPPORTED_CHAIN_IDS = [1, 5, 11155111, 137, 534351]

/**
 * Validates whether the given string is a valid Ethereum address.
 *
 * @param address - Vault contract address
 * @returns True if the address is valid
 */
export function validateVaultAddress(address: string): boolean {
  return isAddress(address)
}

/**
 * Checks if the provided chain ID is supported by the application.
 *
 * @param chainId - Blockchain chain ID
 * @returns True if the chain ID is supported
 */
export function validateChainId(chainId: number): boolean {
  return SUPPORTED_CHAIN_IDS.includes(chainId)
}

/**
 * Validates vault routing parameters before navigation or contract interaction.
 *
 * @param address - Vault contract address
 * @param chainId - Blockchain chain ID
 * @returns Validation result with optional error message
 */
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
