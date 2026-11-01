import { describe, expect, it, vi } from 'vitest'
import { createMemoryStorage } from '@/__tests__/factories'
import { createPersistedValue } from '../storage'

interface Settings {
  volume: number
}

const isSettings = (value: unknown): value is Settings =>
  typeof value === 'object' && value !== null && typeof (value as Settings).volume === 'number'

describe('createPersistedValue', () => {
  it('returns null when nothing has been stored', () => {
    const persisted = createPersistedValue('settings', isSettings, createMemoryStorage())
    expect(persisted.load()).toBeNull()
  })

  it('round-trips a valid value', () => {
    const storage = createMemoryStorage()
    const persisted = createPersistedValue('settings', isSettings, storage)

    persisted.save({ volume: 7 })

    expect(storage.data.get('settings')).toBe('{"volume":7}')
    expect(persisted.load()).toEqual({ volume: 7 })
  })

  it('discards and removes a value that fails validation', () => {
    const storage = createMemoryStorage({ settings: '{"volume":"loud"}' })
    const persisted = createPersistedValue('settings', isSettings, storage)

    expect(persisted.load()).toBeNull()
    expect(storage.data.has('settings')).toBe(false)
  })

  it('discards malformed JSON', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage = createMemoryStorage({ settings: '{"volume":' })
    const persisted = createPersistedValue('settings', isSettings, storage)

    expect(persisted.load()).toBeNull()
    expect(storage.data.has('settings')).toBe(false)
  })

  it('refuses to parse suspiciously large payloads', () => {
    const storage = createMemoryStorage({ settings: `{"volume":1,"x":"${'a'.repeat(20_000)}"}` })
    const persisted = createPersistedValue('settings', isSettings, storage)

    expect(persisted.load()).toBeNull()
    expect(storage.data.has('settings')).toBe(false)
  })

  it('keeps working when the storage throws', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const broken = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => {
        throw new Error('SecurityError')
      },
    }
    const persisted = createPersistedValue('settings', isSettings, broken)

    expect(persisted.load()).toBeNull()
    expect(() => persisted.save({ volume: 1 })).not.toThrow()
    expect(() => persisted.clear()).not.toThrow()
    expect(warn).toHaveBeenCalled()
  })

  it('does nothing without a storage backend', () => {
    const persisted = createPersistedValue('settings', isSettings, null)
    persisted.save({ volume: 3 })
    expect(persisted.load()).toBeNull()
  })

  it('uses localStorage by default', () => {
    localStorage.clear()
    const persisted = createPersistedValue('settings', isSettings)
    persisted.save({ volume: 5 })
    expect(localStorage.getItem('settings')).toBe('{"volume":5}')
    persisted.clear()
    expect(localStorage.getItem('settings')).toBeNull()
  })
})
