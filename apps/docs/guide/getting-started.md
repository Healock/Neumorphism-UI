# 开始使用

```bash
pnpm add @healock/neumorphism-ui@beta
pnpm add -D unocss
```

在 `vite.config.ts` 启用 UnoCSS：

```ts
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), UnoCSS()],
})
```

在 `uno.config.ts` 组合通用布局 utilities 与神经拟态 utilities：

```ts
import { presetNeumorphism } from '@healock/neumorphism-ui/preset'
import { defineConfig, presetWind4 } from 'unocss'

export default defineConfig({
  presets: [presetWind4(), presetNeumorphism()],
})
```

在 `main.ts` 导入一次样式并安装插件：

```ts
import 'virtual:uno.css'
import '@healock/neumorphism-ui/style.css'
import { NeumorphismUI } from '@healock/neumorphism-ui'

app.use(NeumorphismUI)
```

也可以按需导入：

```vue
<script setup lang="ts">
import { NeuButton, NeuCard } from '@healock/neumorphism-ui'
</script>

<template>
  <NeuCard surface="convex">
    <NeuButton variant="primary">保存</NeuButton>
  </NeuCard>
</template>
```

不需要内置字体时改用 `core.css`。正文、代码高亮和旧版兼容样式分别从 `content.css`、`highlight.css`、`legacy.css` 导入。

如果项目不是 Vue 应用，例如 Halo Theme Neu，可以只在构建期导入 CSS：

```css
@import "@healock/neumorphism-ui/tokens.css";
@import "@healock/neumorphism-ui/base.css";
@import "@healock/neumorphism-ui/utilities.css";
@import "@healock/neumorphism-ui/components.css";
```

历史上依赖 `neu-ui.css` 的项目可以用 `@healock/neumorphism-ui/neu-ui.css` 作为迁移入口。
