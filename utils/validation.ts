import { getSupportedChainIds } from './chains'

export const isHexAddress = (addr: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(addr)

export const normalizeAddress = (addr: string): `0x${string}` | null => {
  if (!addr) return null
  const a = addr.trim()
  return isHexAddress(a) ? (a as `0x${string}`) : null
}

export const isValidChainId = (id: number): boolean => {
  if (!Number.isFinite(id)) return false
  return getSupportedChainIds().includes(id)
}

export const parseVaultPathParam = (pv: string): { address: `0x${string}` | null; chainId: number | null } => {
  if (!pv) return { address: null, chainId: null }
  let addr = pv
  let cid: number | null = null
  if (pv.includes(':')) {
    const [a, c] = pv.split(':')
    addr = a
    cid = Number(c)
  } else if (pv.includes('@')) {
    const [a, c] = pv.split('@')
    addr = a
    cid = Number(c)
  }
  const naddr = normalizeAddress(addr)
  const validCid = cid !== null && isValidChainId(cid) ? cid : null
  return { address: naddr, chainId: validCid }
}

export const parseChainIdInput = (val: string): number | null => {
  const num = Number(val)
  if (!Number.isFinite(num)) return null
  return isValidChainId(num) ? num : null
}
