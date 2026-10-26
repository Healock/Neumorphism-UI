import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import {
  NeuAccordion,
  NeuBreadcrumb,
  NeuEmptyState,
  NeuModal,
  NeuSegmented,
  NeuSelect,
  NeuSkeleton,
  NeuSlider,
  NeuTooltip,
} from '../src'

beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    Object.defineProperty(globalThis, 'ResizeObserver', { value: ResizeObserverMock })
  }
})

describe('extended components', () => {
  it('renders skeleton lines as decorative placeholders', () => {
    const wrapper = mount(NeuSkeleton, { props: { lines: 3, height: 12 } })
    expect(wrapper.findAll('.neu-skeleton')).toHaveLength(3)
    expect(wrapper.get('.neu-skeleton-lines').attributes('aria-hidden')).toBe('true')
  })

  it('updates the slider model and exposes its range', async () => {
    const wrapper = mount(NeuSlider, {
      props: { modelValue: 25, label: 'Volume', min: 0, max: 50 },
    })
    const input = wrapper.get('input[type="range"]')
    expect(input.attributes()).toMatchObject({ min: '0', max: '50' })
    await input.setValue('40')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([40])
  })

  it('coordinates segmented radio options', async () => {
    const wrapper = mount(NeuSegmented, {
      props: {
        modelValue: 'grid',
        items: [
          { value: 'grid', label: 'Grid' },
          { value: 'list', label: 'List' },
        ],
      },
    })
    const inputs = wrapper.findAll('input[type="radio"]')
    expect(inputs).toHaveLength(2)
    expect((inputs[0].element as HTMLInputElement).checked).toBe(true)
    await inputs[1].setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['list'])
  })

  it('renders breadcrumb links and marks the current page', () => {
    const wrapper = mount(NeuBreadcrumb, {
      props: {
        items: [
          { label: 'Home', href: '/' },
          { label: 'Components', href: '/components' },
          { label: 'Modal' },
        ],
      },
    })
    expect(wrapper.findAll('a')).toHaveLength(2)
    expect(wrapper.get('[aria-current="page"]').text()).toBe('Modal')
  })

  it('renders an empty state with its action slot', () => {
    const wrapper = mount(NeuEmptyState, {
      props: { title: 'No results', description: 'Try another query.' },
      slots: { default: '<button>Clear</button>' },
    })
    expect(wrapper.text()).toContain('No results')
    expect(wrapper.find('.neu-empty__actions button').exists()).toBe(true)
  })

  it('opens a modal from its trigger and renders its title', async () => {
    const wrapper = mount(NeuModal, {
      props: { open: false, title: 'Invite teammate', description: 'Send an invitation.' },
      slots: {
        trigger: '<button>Open</button>',
        default: '<p>Body</p>',
      },
      attachTo: document.body,
      global: { stubs: { teleport: false } },
    })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:open')?.[0]).toEqual([true])

    await wrapper.setProps({ open: true })
    await nextTick()
    expect(document.body.textContent).toContain('Invite teammate')
    expect(document.body.textContent).toContain('Body')
    expect(document.body.querySelector('.neu-modal__close-icon')?.textContent).toBe('×')
    wrapper.unmount()
  })

  it('emits accordion changes for single and multiple modes', async () => {
    const single = mount(NeuAccordion, {
      props: {
        type: 'single',
        items: [
          { value: 'one', title: 'One', content: 'First' },
          { value: 'two', title: 'Two', content: 'Second' },
        ],
      },
    })
    await single.findAll('.neu-accordion__trigger')[0].trigger('click')
    expect(single.emitted('update:modelValue')?.[0]).toEqual(['one'])

    const multiple = mount(NeuAccordion, {
      props: {
        type: 'multiple',
        modelValue: [],
        items: [{ value: 'one', title: 'One', content: 'First' }],
      },
    })
    await multiple.get('.neu-accordion__trigger').trigger('click')
    expect(multiple.emitted('update:modelValue')?.[0]).toEqual([['one']])
  })

  it('renders a select trigger with a placeholder', () => {
    const wrapper = mount(NeuSelect, {
      props: {
        modelValue: '',
        label: 'Plan',
        items: [
          { value: 'starter', label: 'Starter' },
          { value: 'team', label: 'Team' },
        ],
      },
    })
    expect(wrapper.get('.neu-select__trigger').attributes('aria-label')).toBe('Plan')
    expect(wrapper.find('.neu-select__icon svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('请选择')
  })

  it('renders a tooltip trigger without requiring an open state', () => {
    const wrapper = mount(NeuTooltip, {
      props: { content: 'More info' },
      slots: { trigger: '<button>Info</button>' },
    })
    expect(wrapper.get('button').text()).toBe('Info')
  })
})
