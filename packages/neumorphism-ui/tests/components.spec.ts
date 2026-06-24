import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import {
  NeuButton,
  NeuCheckbox,
  NeuInput,
  NeuPagination,
  NeuProgress,
  NeuRadio,
  NeuRadioGroup,
  NeuSwitch,
  NeuTab,
  NeuTabs,
  NeuTextarea,
  NeuThemeProvider,
} from '../src'

describe('form components', () => {
  it('updates an input model and exposes accessible error state', async () => {
    const wrapper = mount(NeuInput, {
      props: { modelValue: '', label: 'Password', type: 'password', error: 'Required', id: 'password' },
    })
    const input = wrapper.get('input')
    await input.setValue('secret')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['secret'])
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('label').text()).toContain('Password')
  })

  it('connects textarea error text to the native control', () => {
    const wrapper = mount(NeuTextarea, {
      props: { modelValue: '', label: 'Notes', error: 'Required', id: 'notes' },
    })
    const textarea = wrapper.get('textarea')
    const help = wrapper.get('#notes-help')

    expect(textarea.attributes('aria-describedby')).toBe('notes-help')
    expect(textarea.attributes('aria-invalid')).toBe('true')
    expect(help.classes()).toContain('is-error')
  })

  it('keeps native controls focusable while updating switch and checkbox models', async () => {
    const switchWrapper = mount(NeuSwitch, { props: { modelValue: false, label: 'Dark mode' } })
    await switchWrapper.get('input').setValue(true)
    expect(switchWrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    expect(switchWrapper.get('input').attributes('role')).toBe('switch')

    const checkbox = mount(NeuCheckbox, { props: { modelValue: false, label: 'Accept' } })
    expect(checkbox.get('input').attributes('type')).toBe('checkbox')
    expect(checkbox.get('input').classes()).toContain('neu-visually-hidden-input')
  })

  it('coordinates radio values through a group', async () => {
    const wrapper = mount({
      components: { NeuRadioGroup, NeuRadio },
      template: `
        <NeuRadioGroup model-value="a">
          <NeuRadio value="a">A</NeuRadio>
          <NeuRadio value="b">B</NeuRadio>
        </NeuRadioGroup>
      `,
    })
    expect(wrapper.findAll('input')[0].element.checked).toBe(true)
  })

  it('reacts when a radio group becomes disabled', async () => {
    const host = defineComponent({
      components: { NeuRadioGroup, NeuRadio },
      props: { disabled: Boolean },
      template: `
        <NeuRadioGroup model-value="a" :disabled="disabled">
          <NeuRadio value="a">A</NeuRadio>
        </NeuRadioGroup>
      `,
    })
    const wrapper = mount(host, { props: { disabled: false } })
    expect(wrapper.get('input').element.disabled).toBe(false)
    await wrapper.setProps({ disabled: true })
    expect(wrapper.get('input').element.disabled).toBe(true)
  })
})

describe('interaction components', () => {
  it('prevents a loading button from being activated', () => {
    const wrapper = mount(NeuButton, { props: { loading: true }, slots: { default: 'Save' } })
    expect(wrapper.get('button').attributes()).toMatchObject({ disabled: '', 'aria-busy': 'true' })
  })

  it('clamps progress and exposes native progress semantics', () => {
    const wrapper = mount(NeuProgress, { props: { value: 120, max: 100, label: 'Upload' } })
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')
    expect(wrapper.get('.neu-progress__fill').attributes('style')).toContain('100%')
  })

  it('renders declarative NeuTab content inside NeuTabs', () => {
    const wrapper = mount({
      components: { NeuTabs, NeuTab },
      template: `
        <NeuTabs
          model-value="one"
          :items="[
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' },
          ]"
        >
          <NeuTab value="one">First panel</NeuTab>
          <NeuTab value="two">Second panel</NeuTab>
        </NeuTabs>
      `,
    })
    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels).toHaveLength(2)
    expect(panels.filter(panel => panel.isVisible())).toHaveLength(1)
    expect(panels.find(panel => panel.isVisible())?.text()).toContain('First panel')
  })

  it('emits a bounded next page', async () => {
    const wrapper = mount(NeuPagination, { props: { page: 2, total: 35, pageSize: 10 } })
    await wrapper.get('[aria-label="Next page"]').trigger('click')
    expect(wrapper.emitted('update:page')?.[0]).toEqual([3])
  })

  it('applies and removes the resolved theme on the root element', async () => {
    const wrapper = mount(NeuThemeProvider, {
      props: { mode: 'dark', tokens: { primary: '#123456' } },
      slots: { default: 'Content' },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    expect(document.documentElement.dataset.neuTheme).toBe('dark')
    expect(document.documentElement.style.getPropertyValue('--neu-primary')).toBe('#123456')
    wrapper.unmount()
    expect(document.documentElement.hasAttribute('data-neu-theme')).toBe(false)
  })

  it('removes a root token when the provider token override is deleted', async () => {
    const wrapper = mount(NeuThemeProvider, {
      props: { mode: 'light', tokens: { primary: '#123456' } },
      slots: { default: 'Content' },
      attachTo: document.body,
    })
    expect(document.documentElement.style.getPropertyValue('--neu-primary')).toBe('#123456')
    await wrapper.setProps({ tokens: {} })
    await nextTick()
    expect(document.documentElement.style.getPropertyValue('--neu-primary')).toBe('')
  })
})
