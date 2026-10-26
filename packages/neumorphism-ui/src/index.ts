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
  NeuNavPills,
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
} from './components-extra'
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
  NeuTabBar,
  NeuSearchBar,
  NeuSnackbar,
} from './components-material'
import { NeuReveal, NeuTransition } from './motion'
import { NeuThemeProvider, useNeuTheme } from './theme'

export * from './components'
export * from './components-extra'
export * from './components-material'
export * from './motion'
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
  NeuNavPills,
  NeuSelect,
  NeuAccordion,
  NeuModal,
  NeuTooltip,
  NeuSegmented,
  NeuBreadcrumb,
  NeuSkeleton,
  NeuSlider,
  NeuEmptyState,
  NeuAppBar,
  NeuBottomAppBar,
  NeuNavigationBar,
  NeuNavigationRail,
  NeuNavigationDrawer,
  NeuTabBar,
  NeuSearchBar,
  NeuFab,
  NeuSnackbar,
  NeuChip,
  NeuBottomSheet,
  NeuCircularProgress,
  NeuTransition,
  NeuReveal,
]

export const NeumorphismUI: Plugin = {
  install(app: App) {
    for (const component of components) {
      app.component(component.name!, component)
    }
  },
}

export { NeuThemeProvider, useNeuTheme }
