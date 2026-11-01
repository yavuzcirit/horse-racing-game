const MAX_UINT32 = 0xffff_ffff
const SEED_PATTERN = /^\d{1,10}$/

export function createSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 0
}

export function parseSeed(raw: string | null | undefined): number | null {
  if (raw == null || !SEED_PATTERN.test(raw)) return null
  const value = Number(raw)
  return value <= MAX_UINT32 ? value : null
}

export function readSeedFromUrl(search: string): number | null {
  return parseSeed(new URLSearchParams(search).get('seed'))
}

export function deriveSeed(seed: number, salt: number): number {
  let hash = (seed ^ Math.imul(salt + 1, 0x9e37_79b9)) >>> 0
  hash = Math.imul(hash ^ (hash >>> 16), 0x85eb_ca6b)
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2_ae35)
  return (hash ^ (hash >>> 16)) >>> 0
}

export function isSeed(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= MAX_UINT32
}
