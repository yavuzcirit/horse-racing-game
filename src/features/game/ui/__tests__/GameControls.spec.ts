import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useRaceStore } from '@/features/race'
import { useGameStore } from '../../store/useGameStore'
import GameControls from '../GameControls.vue'
import NewSessionButton from '../NewSessionButton.vue'

describe('GameControls', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    useGameStore().initialize({ seed: 5, saved: null })
  })

  const mountControls = () => mount(GameControls, { global: { plugins: [pinia] } })
  const buttons = (wrapper: ReturnType<typeof mountControls>) => {
    const [generate, toggle] = wrapper.findAll('button')
    return { generate: generate!, toggle: toggle! }
  }

  it('only allows generating before a program exists', () => {
    const { generate, toggle } = buttons(mountControls())
    expect(generate.attributes('disabled')).toBeUndefined()
    expect(toggle.text()).toBe('Start')
    expect(toggle.attributes('disabled')).toBeDefined()
  })

  it('walks through generate, start, pause and resume', async () => {
    const wrapper = mountControls()
    const { generate, toggle } = buttons(wrapper)

    await generate.trigger('click')
    expect(useRaceStore().status).toBe('ready')
    expect(toggle.attributes('disabled')).toBeUndefined()

    await toggle.trigger('click')
    expect(toggle.text()).toBe('Pause')
    expect(generate.attributes('disabled')).toBeDefined()

    await toggle.trigger('click')
    expect(toggle.text()).toBe('Resume')
    expect(generate.attributes('disabled')).toBeUndefined()
  })

  it('changes the race speed', async () => {
    const wrapper = mountControls()
    const radios = wrapper.findAll<HTMLInputElement>('input[type="radio"]')
    expect(radios.map((radio) => radio.element.checked)).toEqual([true, false, false])

    await radios[2]!.setValue()
    expect(useRaceStore().speed).toBe(4)
  })
})

describe('NewSessionButton', () => {
  it('starts a new session unless a race is running', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const game = useGameStore()
    game.initialize({ seed: 5, saved: null })
    const wrapper = mount(NewSessionButton, { global: { plugins: [pinia] } })

    await wrapper.get('button').trigger('click')
    expect(game.seed).not.toBe(5)

    game.generateProgram()
    useRaceStore().start()
    await wrapper.vm.$nextTick()
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })
})
