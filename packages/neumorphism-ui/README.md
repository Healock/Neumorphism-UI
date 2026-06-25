# @healock/neumorphism-ui

Accessible neumorphism utilities and Vue 3 components for Vite.

```bash
pnpm add @healock/neumorphism-ui@beta
pnpm add -D unocss
```

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), UnoCSS()],
})
```

```ts
// uno.config.ts
import { presetNeumorphism } from '@healock/neumorphism-ui/preset'
import { defineConfig, presetWind4 } from 'unocss'

export default defineConfig({
  presets: [presetWind4(), presetNeumorphism()],
})
```

```ts
// main.ts
import '@healock/neumorphism-ui/style.css'
import { NeumorphismUI } from '@healock/neumorphism-ui'

app.use(NeumorphismUI)
```

Use `@healock/neumorphism-ui/core.css` to omit the bundled Noto Sans SC font,
or import components such as `NeuButton` directly for on-demand tree-shaking.
