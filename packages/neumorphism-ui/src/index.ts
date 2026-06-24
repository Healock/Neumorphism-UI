import type { App, Plugin } from 'vue'
import {
  NeuAlert,
  NeuAvatar,
  NeuButton,
  NeuCard,
  NeuCheckbox,
  NeuDropdown,
  NeuDropdownItem,
  NeuInput,
  NeuNavbar,
  NeuPagination,
  NeuProgress,
  NeuRadio,
  NeuRadioGroup,
  NeuSwitch,
  NeuTab,
  NeuTabs,
  NeuTag,
  NeuTextarea,
} from './components'
import { NeuThemeProvider, useNeuTheme } from './theme'

export * from './components'
export * from './theme'

const components = [
  NeuThemeProvider,
  NeuButton,
  NeuCard,
  NeuInput,
  NeuTextarea,
  NeuSwitch,
  NeuCheckbox,
  NeuRadio,
  NeuRadioGroup,
  NeuTag,
  NeuAvatar,
  NeuAlert,
  NeuProgress,
  NeuPagination,
  NeuTabs,
  NeuTab,
  NeuDropdown,
  NeuDropdownItem,
  NeuNavbar,
]

export const NeumorphismUI: Plugin = {
  install(app: App) {
    for (const component of components) {
      app.component(component.name!, component)
    }
  },
}

export { NeuThemeProvider, useNeuTheme }
