export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isNonNegativeInteger(
  value: unknown,
  max = Number.MAX_SAFE_INTEGER,
): value is number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= max
}

export function isFiniteNonNegative(value: unknown, max = Number.MAX_VALUE): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max
}

export function isOneOf<const T extends readonly unknown[]>(
  options: T,
  value: unknown,
): value is T[number] {
  return options.includes(value)
}
