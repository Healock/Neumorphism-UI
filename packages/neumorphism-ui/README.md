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

For non-Vue consumers such as server templates, static pages, or Halo themes,
import the CSS runtime at build time:

```css
@import "@healock/neumorphism-ui/tokens.css";
@import "@healock/neumorphism-ui/base.css";
@import "@healock/neumorphism-ui/utilities.css";
@import "@healock/neumorphism-ui/components.css";
```

Projects replacing the historical `https://cdn.healock.cc/css/neu-ui.css`
can use the compatibility entry with bundled font imports:

```css
@import "@healock/neumorphism-ui/neu-ui.css";
```

If the host project already owns its font strategy, use the no-fonts aggregate
instead. It keeps the same core, compatibility, content, and highlight layers,
but does not import `fonts.css` or Fontsource:

```css
@import "@healock/neumorphism-ui/neu-ui-no-fonts.css";
```

Import that file during your app/theme build and ship the generated CSS with
your own project. This keeps production pages off mutable `latest` CDN CSS while
preserving the old CSS contract for migration.

The compatibility entry keeps old variables and class aliases such as
`--bg-color`, `--text-main`, `html.dark`, `body.dark-mode`, `.neu-btn-sm`,
`.neu-title`, and `.neu-dropdown-menu`, but it does not restore old global
side effects such as scrollbar hiding or global outline removal.

`NeuNavPills` provides the small rounded navigation pills used by the demo
navbar. It renders real links by default and marks the current page with
`aria-current="page"`:

```vue
<NeuNavPills
  model-value="components"
  :items="[
    { value: 'overview', label: '首页', href: '/' },
    { value: 'components', label: '组件', href: '/components' },
    { value: 'motion', label: '动效', href: '/motion' },
  ]"
/>
```

## Font loading

`style.css` imports `fonts.css`, which uses Fontsource's default
`font-display: swap`. The design font token is intentionally Noto-first:
`--neu-font-sans: "Noto Sans SC", sans-serif`.

With the default swap entry, a browser may briefly show its generic sans-serif
fallback before Noto Sans SC arrives.

If a project wants to avoid that first-paint fallback, import the layout/styles
separately and load the blocking font entry as early as possible:

```html
<link rel="stylesheet" href="/src/app-fonts.css">
```

```css
/* /src/app-fonts.css */
@import "@healock/neumorphism-ui/fonts-block.css";
```

```ts
import '@healock/neumorphism-ui/core.css'
```

`fonts-block.css` deliberately loads the Latin and Simplified Chinese 400/500/700
faces with `font-display: block`. It is deterministic and not based on guessing
page text, but it is heavier than `fonts.css`, so keep it an app-level choice.
