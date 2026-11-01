import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useHorsesStore } from '@/features/horses'
import { useRaceStore } from '../../store/useRaceStore'
import ProgramPanel from '../ProgramPanel.vue'
import ResultsPanel from '../ResultsPanel.vue'

describe('ProgramPanel and ResultsPanel', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    useHorsesStore().generate(8)
  })

  const mountPanel = (component: typeof ProgramPanel | typeof ResultsPanel) =>
    mount(component, { global: { plugins: [pinia] } })

  it('explain what to do while empty', () => {
    expect(mountPanel(ProgramPanel).text()).toContain('Press Generate Program')
    expect(mountPanel(ResultsPanel).text()).toContain('Results appear here')
  })

  it('lists every round of the program with its ten runners', async () => {
    const race = useRaceStore()
    const wrapper = mountPanel(ProgramPanel)
    race.generateProgram(4)
    await wrapper.vm.$nextTick()

    const captions = wrapper.findAll('caption').map((caption) => caption.text())
    expect(captions).toEqual([
      'Round 1 · 1200 m',
      'Round 2 · 1400 m',
      'Round 3 · 1600 m',
      'Round 4 · 1800 m',
      'Round 5 · 2000 m',
      'Round 6 · 2200 m',
    ])
    expect(wrapper.findAll('table').every((table) => table.findAll('tbody tr').length === 10)).toBe(
      true,
    )
    expect(wrapper.find('.round-table--active').exists()).toBe(false)

    race.start()
    await wrapper.vm.$nextTick()
    expect(wrapper.get('.round-table--active caption').text()).toBe('Round 1 · 1200 m')
  })

  it('adds a result table with finishing times as each round ends', async () => {
    const race = useRaceStore()
    const horses = useHorsesStore()
    const wrapper = mountPanel(ResultsPanel)
    race.generateProgram(4)
    race.start()
    while (race.results.length === 0) race.tick(100)
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('table')).toHaveLength(1)
    expect(wrapper.get('caption').text()).toBe('Round 1 · 1200 m')
    expect(wrapper.findAll('thead th').map((th) => th.text())).toEqual(['Pos', 'Name', 'Time'])

    const winner = race.results[0]!.placements[0]!
    const firstRow = wrapper.get('tbody tr')
    expect(firstRow.text()).toContain(horses.nameOf(winner.horseId))
    expect(firstRow.text()).toMatch(/\d:\d{2}\.\d{2}/)
  })
})
