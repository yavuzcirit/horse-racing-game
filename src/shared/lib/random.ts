export interface RandomSource {
  next(): number
}

export function createRandom(seed: number): RandomSource {
  let state = seed >>> 0

  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0
      let t = state
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
    },
  }
}

export function randomInt(random: RandomSource, min: number, max: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
    throw new RangeError(`Invalid integer range [${min}, ${max}]`)
  }
  return min + Math.floor(random.next() * (max - min + 1))
}

export function randomBetween(random: RandomSource, min: number, max: number): number {
  return min + random.next() * (max - min)
}

export function shuffle<T>(random: RandomSource, items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random.next() * (i + 1))
    const current = result[i] as T
    result[i] = result[j] as T
    result[j] = current
  }
  return result
}

export function sample<T>(random: RandomSource, items: readonly T[], count: number): T[] {
  if (!Number.isInteger(count) || count < 0 || count > items.length) {
    throw new RangeError(`Cannot sample ${count} items from a list of ${items.length}`)
  }
  return shuffle(random, items).slice(0, count)
}
