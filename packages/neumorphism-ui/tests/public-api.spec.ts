import { describe, expect, it } from 'vitest'
import { createApp, defineComponent } from 'vue'
import * as ui from '../src/index'
import * as preset from '../src/preset'
import * as theme from '../src/theme'

const componentExports = [
  'NeuThemeProvider',
  'NeuButton',
  'NeuCard',
  'NeuInput',
  'NeuTextarea',
  'NeuSwitch',
  'NeuCheckbox',
  'NeuRadio',
  'NeuRadioGroup',
  'NeuTag',
  'NeuAvatar',
  'NeuAlert',
  'NeuProgress',
  'NeuPagination',
  'NeuTabs',
  'NeuTab',
  'NeuDropdown',
  'NeuDropdownItem',
  'NeuNavbar',
  'NeuNavPills',
] as const

describe('public API', () => {
  it('exports the plugin and all v1 components', () => {
    expect(ui).toHaveProperty('NeumorphismUI')
    for (const name of componentExports) {
      expect(ui, name).toHaveProperty(name)
    }
  })

  it('registers every v1 component through the plugin', () => {
    const app = createApp(defineComponent({ render: () => null }))
    app.use(ui.NeumorphismUI)
    for (const name of componentExports) {
      expect(app.component(name)).toBe(ui[name])
    }
  })

  it('exports the UnoCSS preset', () => {
    expect(preset).toHaveProperty('presetNeumorphism')
  })

  it('exports the theme composable and public theme types module', () => {
    expect(theme).toHaveProperty('useNeuTheme')
    expect(theme).toHaveProperty('NeuThemeProvider')
  })
})
