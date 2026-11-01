import { logger } from '@/shared/lib/logger'

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export interface PersistedValue<T> {
  load(): T | null
  save(value: T): void
  clear(): void
}

const MAX_STORED_LENGTH = 16_384

export function createPersistedValue<T>(
  key: string,
  validate: (value: unknown) => value is T,
  storage: StorageLike | null = getLocalStorage(),
): PersistedValue<T> {
  function clear() {
    try {
      storage?.removeItem(key)
    } catch (error) {
      logger.warn(`Could not clear "${key}"`, error)
    }
  }

  return {
    load() {
      if (!storage) return null
      try {
        const raw = storage.getItem(key)
        if (raw === null) return null
        if (raw.length > MAX_STORED_LENGTH) {
          clear()
          return null
        }
        const parsed: unknown = JSON.parse(raw)
        if (validate(parsed)) return parsed
      } catch (error) {
        logger.warn(`Ignoring unreadable value stored under "${key}"`, error)
      }
      clear()
      return null
    },

    save(value) {
      try {
        storage?.setItem(key, JSON.stringify(value))
      } catch (error) {
        logger.warn(`Could not save "${key}"`, error)
      }
    },

    clear,
  }
}

function getLocalStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}
