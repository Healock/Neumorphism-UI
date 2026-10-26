import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NeuReveal, NeuTransition } from '../src'

class MockIntersectionObserver {
  static latest: MockIntersectionObserver | null = null

  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: number[] = []
  readonly observed: Element[] = []
  disconnected = false

  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    MockIntersectionObserver.latest = this
  }

  observe(element: Element) {
    this.observed.push(element)
  }

  unobserve() {}

  disconnect() {
    this.disconnected = true
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  trigger(isIntersecting: boolean) {
    const target = this.observed[0]
    if (!target)
      return
    this.callback([{
      isIntersecting,
      target,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRatio: isIntersecting ? 1 : 0,
      intersectionRect: target.getBoundingClientRect(),
      rootBounds: null,
      time: 0,
    }], this as unknown as IntersectionObserver)
  }
}

describe('motion primitives', () => {
  beforeEach(() => {
    MockIntersectionObserver.latest = null
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 900,
      bottom: 1000,
      left: 0,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 900,
      toJSON: () => ({}),
    } as DOMRect)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('reveals an off-screen element once it intersects', async () => {
    const wrapper = mount(NeuReveal, {
      props: { delay: 120, duration: 480 },
      slots: { default: () => h('p', 'content') },
    })

    await nextTick()
    expect(wrapper.classes()).toContain('is-armed')
    expect(wrapper.attributes('style')).toContain('--neu-motion-delay: 120ms')

    MockIntersectionObserver.latest?.trigger(true)
    await nextTick()

    expect(wrapper.classes()).toContain('is-visible')
    expect(wrapper.emitted('reveal')).toHaveLength(1)
    expect(MockIntersectionObserver.latest?.disconnected).toBe(true)
  })

  it('shows immediately when disabled and does not observe', async () => {
    const wrapper = mount(NeuReveal, {
      props: { disabled: true },
      slots: { default: () => h('p', 'content') },
    })

    await nextTick()
    expect(wrapper.classes()).toContain('is-visible')
    expect(wrapper.classes()).not.toContain('is-armed')
    expect(MockIntersectionObserver.latest).toBeNull()
  })

  it('can re-reveal when once is false', async () => {
    const wrapper = mount(NeuReveal, {
      props: { once: false },
      slots: { default: () => h('p', 'content') },
    })

    await nextTick()
    const observer = MockIntersectionObserver.latest
    expect(observer).not.toBeNull()

    observer?.trigger(true)
    await nextTick()
    expect(wrapper.classes()).toContain('is-visible')

    observer?.trigger(false)
    await nextTick()
    expect(wrapper.classes()).not.toContain('is-visible')
    expect(wrapper.classes()).toContain('is-armed')

    observer?.trigger(true)
    await nextTick()
    expect(wrapper.emitted('reveal')).toHaveLength(2)
  })

  it('passes timing variables to transition elements', async () => {
    const host = defineComponent({
      components: { NeuTransition },
      setup() {
        const show = ref(true)
        return { show }
      },
      template: `
        <NeuTransition preset="fade-up" :duration="300" :delay="50" appear>
          <div v-if="show" class="box">content</div>
        </NeuTransition>
      `,
    })

    const wrapper = mount(host)
    await nextTick()

    const style = wrapper.get('.box').attributes('style') ?? ''
    expect(style).toContain('--neu-motion-duration: 300ms')
    expect(style).toContain('--neu-motion-delay: 50ms')
  })
})
