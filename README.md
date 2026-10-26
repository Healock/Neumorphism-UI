# Neumorphism UI

Vue 3 组件与 UnoCSS 工具类组成的无障碍神经拟态设计系统。

## 安装

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
// main.ts
import '@healock/neumorphism-ui/style.css'
import 'virtual:uno.css'
import { NeumorphismUI } from '@healock/neumorphism-ui'

app.use(NeumorphismUI)
```

```ts
// uno.config.ts
import { defineConfig, presetWind4 } from 'unocss'
import { presetNeumorphism } from '@healock/neumorphism-ui/preset'

export default defineConfig({
  presets: [presetWind4(), presetNeumorphism()],
})
```

可以全局安装 `NeumorphismUI`，也可以从包根入口按需导入 `NeuButton`、`NeuInput` 等组件。`core.css` 不加载字体；`content.css`、`highlight.css` 和 `legacy.css` 均为可选入口。

动效层包含 CSS 工具类与 `NeuTransition` / `NeuReveal` 两个 Vue 原语，入口为 `motion.css`；`core.css` 已内置。它覆盖入场、错峰、循环、滚动揭示和 reduced-motion 终态，详细 API 见 `apps/docs/motion.md`。

Material 外壳与反馈组件包括 `NeuAppBar`、`NeuBottomAppBar`、`NeuTabBar`、`NeuNavigationBar`、`NeuNavigationRail`、`NeuNavigationDrawer`、`NeuSearchBar`、`NeuFab`、`NeuSnackbar`、`NeuChip`、`NeuBottomSheet` 与 `NeuCircularProgress`。`NeuFab` 支持环形 action wheel；这些组件都由根入口导出，并可通过 `app.use(NeumorphismUI)` 全局注册。详细 API 见 `apps/docs/components/material.md`。

非 Vue / 服务端模板项目可以直接消费 npm CSS exports。`neu-ui.css` 是带字体的完整兼容入口；`neu-ui-no-fonts.css` 是不带字体的完整兼容入口，适合已有字体策略的项目。

完整文档位于 `apps/docs`。公开包采用 MIT 许可证；Noto Sans SC 采用 SIL OFL 1.1。

原始 `neu-ui.css` 与静态演示页保存在 `examples/legacy/`，用于 1.x 兼容回归，不作为新组件源码入口。

发布前的一次性 npm/OIDC 引导流程见 `RELEASING.md`。
