import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import {
  NeuAppBar,
  NeuBottomAppBar,
  NeuBottomSheet,
  NeuChip,
  NeuCircularProgress,
  NeuFab,
  NeuNavigationBar,
  NeuNavigationDrawer,
  NeuNavigationRail,
  NeuSearchBar,
  NeuSnackbar,
  NeuTabBar,
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

const navItems = [
  { value: 'home', label: 'Home', icon: '⌂' },
  { value: 'search', label: 'Search', icon: '⌕' },
]

describe('material components', () => {
  it('renders app bar slots and an accessible bottom app bar', () => {
    const appBar = mount(NeuAppBar, {
      props: { title: 'Workspace', subtitle: 'Synced' },
      slots: { leading: '<button>Menu</button>', actions: '<button>Publish</button>' },
    })
    expect(appBar.get('.neu-app-bar__title').text()).toBe('Workspace')
    expect(appBar.find('.neu-app-bar__leading button').exists()).toBe(true)
    expect(appBar.find('.neu-app-bar__actions button').exists()).toBe(true)

    const bottom = mount(NeuBottomAppBar, { slots: { actions: '<button>Undo</button>' } })
    expect(bottom.get('footer').attributes('aria-label')).toBe('Bottom app bar')
    expect(bottom.find('.neu-bottom-app-bar__actions button').exists()).toBe(true)
  })

  it('marks the active navigation item and emits changes', async () => {
    const bar = mount(NeuNavigationBar, { props: { modelValue: 'home', items: navItems } })
    expect(bar.findAll('.neu-navigation-bar__item')).toHaveLength(2)
    expect(bar.get('[aria-current="page"]').text()).toContain('Home')
    await bar.findAll('.neu-navigation-bar__item')[1].trigger('click')
    expect(bar.emitted('update:modelValue')?.[0]).toEqual(['search'])
  })

  it('renders the navigation rail and its fab slot', async () => {
    const rail = mount(NeuNavigationRail, {
      props: { modelValue: 'home', items: navItems },
      slots: { fab: '<button>New</button>' },
    })
    expect(rail.findAll('.neu-navigation-rail__item')).toHaveLength(2)
    expect(rail.find('.neu-navigation-rail__fab button').exists()).toBe(true)
    await rail.findAll('.neu-navigation-rail__item')[1].trigger('click')
    expect(rail.emitted('update:modelValue')?.[0]).toEqual(['search'])
  })

  it('renders and updates the tab bar', async () => {
    const tabs = mount(NeuTabBar, {
      props: {
        modelValue: 'one',
        items: [{ value: 'one', label: 'One' }, { value: 'two', label: 'Two' }],
        label: 'Sections',
      },
    })
    expect(tabs.findAll('.neu-tab-bar__item')).toHaveLength(2)
    expect(tabs.find('.neu-tab-bar__indicator').attributes('aria-hidden')).toBe('true')
    await tabs.findAll('.neu-tab-bar__item')[1].trigger('click')
    expect(tabs.emitted('update:modelValue')?.[0]).toEqual(['two'])
  })

  it('opens the navigation drawer through its trigger', async () => {
    const drawer = mount(NeuNavigationDrawer, {
      props: { open: false, items: navItems, title: 'Navigation' },
      slots: { trigger: '<button>Open</button>' },
      attachTo: document.body,
      global: { stubs: { teleport: false } },
    })
    await drawer.get('button').trigger('click')
    expect(drawer.emitted('update:open')?.[0]).toEqual([true])
    await drawer.setProps({ open: true })
    await nextTick()
    expect(document.body.textContent).toContain('Navigation')
    expect(document.body.querySelectorAll('.neu-drawer__item')).toHaveLength(2)
    drawer.unmount()
  })

  it('submits and clears a search query', async () => {
    const search = mount(NeuSearchBar, { props: { modelValue: 'neumorphism', label: 'Search components' } })
    await search.get('input').setValue('charts')
    expect(search.emitted('update:modelValue')?.[0]).toEqual(['charts'])
    await search.get('form').trigger('submit')
    expect(search.emitted('submit')?.[0]).toEqual(['neumorphism'])
    await search.get('.neu-search-bar__clear').trigger('click')
    expect(search.emitted('clear')).toHaveLength(1)
  })

  it('opens a fab wheel, emits a selection, and closes', async () => {
    const fab = mount(NeuFab, {
      props: {
        modelValue: false,
        actions: [
          { value: 'note', label: 'New note', icon: '✎' },
          { value: 'upload', label: 'Upload' },
        ],
      },
    })
    await fab.get('.neu-fab__trigger').trigger('click')
    expect(fab.emitted('update:modelValue')?.[0]).toEqual([true])
    await fab.setProps({ modelValue: true })
    await nextTick()
    expect(fab.findAll('.neu-fab__action')).toHaveLength(2)
    await fab.findAll('.neu-fab__action')[0].trigger('click')
    expect(fab.emitted('select')?.[0]?.[0]).toMatchObject({ value: 'note' })
    expect(fab.emitted('update:modelValue')?.[1]).toEqual([false])
  })

  it('announces snackbar content and supports its action', async () => {
    const snack = mount(NeuSnackbar, { props: { open: true, message: 'Saved', actionLabel: 'Undo' } })
    expect(snack.get('.neu-snackbar').attributes('role')).toBe('status')
    expect(snack.text()).toContain('Saved')
    await snack.get('.neu-snackbar__action').trigger('click')
    expect(snack.emitted('action')).toHaveLength(1)
    expect(snack.emitted('update:open')?.[0]).toEqual([false])
  })

  it('toggles filter chips and emits removal', async () => {
    const chip = mount(NeuChip, {
      props: { variant: 'filter', selected: false, removable: true },
      slots: { default: 'Recent' },
    })
    expect(chip.get('.neu-chip__body').attributes('aria-pressed')).toBe('false')
    await chip.get('.neu-chip__body').trigger('click')
    expect(chip.emitted('update:selected')?.[0]).toEqual([true])
    await chip.get('.neu-chip__remove').trigger('click')
    expect(chip.emitted('remove')).toHaveLength(1)
  })

  it('opens the bottom sheet and exposes progress semantics', async () => {
    const sheet = mount(NeuBottomSheet, {
      props: { open: false, title: 'Export' },
      slots: { trigger: '<button>Open sheet</button>', default: '<p>Choose a format</p>' },
      attachTo: document.body,
      global: { stubs: { teleport: false } },
    })
    await sheet.get('button').trigger('click')
    expect(sheet.emitted('update:open')?.[0]).toEqual([true])
    await sheet.setProps({ open: true })
    await nextTick()
    expect(document.body.textContent).toContain('Choose a format')
    sheet.unmount()

    const progress = mount(NeuCircularProgress, { props: { value: 68, label: 'Sync' } })
    expect(progress.get('[role="progressbar"]').attributes()).toMatchObject({
      'aria-label': 'Sync',
      'aria-valuenow': '68',
      'aria-valuemax': '100',
    })
  })
})
