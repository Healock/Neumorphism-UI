import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import '@healock/neumorphism-ui/style.css'
import { NeumorphismUI } from '@healock/neumorphism-ui'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(NeumorphismUI)
  },
} satisfies Theme
