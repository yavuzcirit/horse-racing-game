import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { makeMoment, makePlan, makeRun } from '@/__tests__/factories'
import { useHorsesStore } from '@/features/horses'
import { useCommentaryStore } from '../../store/useCommentaryStore'
import CommentaryFeed from '../CommentaryFeed.vue'

describe('CommentaryFeed', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    useHorsesStore().generate(1)
  })

  it('is a polite live region, even while empty', () => {
    const wrapper = mount(CommentaryFeed, { global: { plugins: [pinia] } })
    const feed = wrapper.get('ol')
    expect(feed.attributes('aria-live')).toBe('polite')
    expect(wrapper.text()).toContain('Commentary starts when the first round is under way.')
  })

  it('shows the newest line first with its round', async () => {
    const horses = useHorsesStore()
    const winnerId = horses.horses[0]!.id
    const plans = [makePlan([makeRun(winnerId, 1, [{ atMs: 2_000, metres: 1_000 }])])]
    const commentary = useCommentaryStore()
    const wrapper = mount(CommentaryFeed, { global: { plugins: [pinia] } })

    commentary.observe(makeMoment(0), makeMoment(100), plans)
    commentary.observe(makeMoment(100), makeMoment(2_000), plans)
    await wrapper.vm.$nextTick()

    const lines = wrapper.findAll('li')
    expect(lines).toHaveLength(2)
    expect(lines[0]!.text()).toContain(`${horses.nameOf(winnerId)} wins Round 1`)
    expect(lines[0]!.classes()).toContain('commentary__line--finish')
    expect(lines[1]!.text()).toContain("And they're off!")
    expect(lines[1]!.get('.commentary__round').text()).toBe('R1')
    expect(wrapper.find('.commentary__empty').exists()).toBe(false)
  })
})
