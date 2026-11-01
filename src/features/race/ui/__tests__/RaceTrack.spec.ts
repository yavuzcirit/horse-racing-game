import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useHorsesStore } from '@/features/horses'
import { useRaceStore } from '../../store/useRaceStore'
import RaceTrack from '../RaceTrack.vue'

describe('RaceTrack', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    useHorsesStore().generate(3)
  })

  const mountTrack = () => mount(RaceTrack, { global: { plugins: [pinia] } })

  it('shows ten empty lanes before a program exists', () => {
    const wrapper = mountTrack()
    expect(wrapper.findAll('.lane')).toHaveLength(10)
    expect(wrapper.findAll('.runner')).toHaveLength(0)
    expect(wrapper.get('h2').text()).toBe('No program yet')
    expect(wrapper.get('[data-testid="race-status"]').text()).toContain('Generate a program')
  })

  it('puts the first round in the gates once a program is generated', async () => {
    const race = useRaceStore()
    const horses = useHorsesStore()
    const wrapper = mountTrack()

    race.generateProgram(10)
    await wrapper.vm.$nextTick()

    expect(wrapper.get('h2').text()).toBe('Round 1 · 1200 m')
    expect(wrapper.findAll('.runner')).toHaveLength(10)
    const firstHorse = horses.nameOf(race.rounds[0]!.horseIds[0]!)
    expect(wrapper.findAll('.lane')[0]!.text()).toContain(`Lane 1: ${firstHorse}`)
    expect(wrapper.get('[data-testid="race-status"]').text()).toContain('in the gates')
  })

  it('moves and animates the horses while the race runs', async () => {
    const race = useRaceStore()
    const wrapper = mountTrack()
    race.generateProgram(10)
    race.start()
    race.tick(1_500)
    await wrapper.vm.$nextTick()

    const runner = wrapper.get('.runner')
    expect(runner.classes()).toContain('runner--galloping')
    const progress = (runner.element as HTMLElement).style.getPropertyValue('--progress')
    expect(Number(progress)).toBeGreaterThan(0)
    expect(wrapper.get('[data-testid="race-status"]').text()).toBe('Round 1 of 6 is under way.')
  })

  it('reports pauses, breaks and the end of the program', async () => {
    const race = useRaceStore()
    const wrapper = mountTrack()
    const status = () => wrapper.get('[data-testid="race-status"]').text()

    race.generateProgram(10)
    race.start()
    race.pause()
    await wrapper.vm.$nextTick()
    expect(status()).toBe('Paused.')
    expect(wrapper.find('.runner--galloping').exists()).toBe(false)

    race.start()
    while (race.phase !== 'intermission') race.tick(100)
    await wrapper.vm.$nextTick()
    expect(status()).toContain('about to start')

    while (race.status !== 'finished') race.tick(100)
    await wrapper.vm.$nextTick()
    expect(status()).toBe('All 6 rounds are complete.')
    expect(wrapper.findAll('.lane').every((lane) => lane.text().includes('finished'))).toBe(true)
  })
})
