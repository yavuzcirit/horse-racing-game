import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App.vue'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the whole game screen', () => {
    const wrapper = mount(App, { global: { plugins: [createPinia()] } })
    const headings = wrapper.findAll('h1, h2').map((heading) => heading.text())

    expect(headings).toEqual([
      'Horse Racing',
      'Horse List (1–20)',
      'No program yet',
      'Commentary',
      'Program',
      'Results',
    ])
    expect(wrapper.findAll('.horse-list__row--active')).toHaveLength(0)
    expect(wrapper.get('table').findAll('tbody tr')).toHaveLength(20)
    wrapper.unmount()
  })

  it('highlights the horses of the current round once a program exists', async () => {
    const wrapper = mount(App, { global: { plugins: [createPinia()] } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.findAll('.horse-list__row--active')).toHaveLength(10)
    wrapper.unmount()
  })
})
