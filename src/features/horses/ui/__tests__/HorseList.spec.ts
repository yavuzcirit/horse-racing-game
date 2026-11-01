import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useHorsesStore } from '../../store/useHorsesStore'
import HorseList from '../HorseList.vue'

describe('HorseList', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    useHorsesStore().generate(7)
  })

  it('lists every horse with its condition and colour', () => {
    const wrapper = mount(HorseList, { global: { plugins: [pinia] } })
    const store = useHorsesStore()
    const rows = wrapper.findAll('tbody tr')

    expect(wrapper.get('h2').text()).toBe('Horse List (1–20)')
    expect(rows).toHaveLength(20)

    const first = store.horses[0]!
    expect(rows[0]!.text()).toContain(first.name)
    expect(rows[0]!.text()).toContain(String(first.condition))
    expect(rows[0]!.text()).toContain(first.color.name)
  })

  it('highlights the horses running in the current round', () => {
    const wrapper = mount(HorseList, {
      props: { activeHorseIds: new Set([2, 5]) },
      global: { plugins: [pinia] },
    })
    const active = wrapper
      .findAll('tbody tr')
      .map((row, index) => (row.classes('horse-list__row--active') ? index + 1 : null))
      .filter(Boolean)

    expect(active).toEqual([2, 5])
  })

  it('renders actions passed in by the parent', () => {
    const wrapper = mount(HorseList, {
      slots: { actions: '<button type="button">Shuffle</button>' },
      global: { plugins: [pinia] },
    })
    expect(wrapper.get('.panel__actions button').text()).toBe('Shuffle')
  })
})
