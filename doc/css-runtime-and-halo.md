# CSS runtime 与非 Vue / Halo 消费说明

`@healock/neumorphism-ui` 不只是 Vue 组件库，也提供一套可以被普通 HTML、Thymeleaf、Vite 和 Halo 主题在构建期消费的 CSS runtime。

这份文档只描述组件库侧提供的能力与边界，不要求在组件库仓库里直接修改 Halo 主题。

## 目标

- Vue/Vite 项目继续通过 Vue 组件、UnoCSS preset 和 `style.css` 使用这套视觉系统。
- 非 Vue 项目可以只使用 CSS class contract，不引入 Vue runtime。
- 样式源头统一维护在 `@healock/neumorphism-ui`。
- 生产站点优先加载自己构建后的本地 CSS，而不是依赖可变的远程 `latest` CDN 文件。
- 历史上依赖 `https://cdn.healock.cc/css/neu-ui.css` 的项目，可以用 npm 包里的兼容入口平滑迁移。

## CSS 入口

### 现代模块化入口

适合新项目，或者已经愿意按层控制影响范围的项目：

```css
@import "@healock/neumorphism-ui/tokens.css";
@import "@healock/neumorphism-ui/base.css";
@import "@healock/neumorphism-ui/utilities.css";
@import "@healock/neumorphism-ui/components.css";
```

可选能力：

```css
@import "@healock/neumorphism-ui/content.css";
@import "@healock/neumorphism-ui/highlight.css";
@import "@healock/neumorphism-ui/view-transition.css";
```

### Vue/Vite 完整入口

```ts
import '@healock/neumorphism-ui/style.css'
```

`style.css` 包含：

- `fonts.css`
- `core.css`

其中 `core.css` 再引入：

- `tokens.css`
- `base.css`
- `utilities.css`
- `components.css`

### 旧 CDN 替代入口

```css
@import "@healock/neumorphism-ui/neu-ui.css";
```

`neu-ui.css` 是迁移入口，面向历史上直接使用 `https://cdn.healock.cc/css/neu-ui.css` 的项目。它会提供字体、核心样式、旧变量/旧 class 兼容层、正文排版和代码高亮样式。

如果宿主项目已经有自己的字体策略，使用不带字体的完整聚合入口：

```css
@import "@healock/neumorphism-ui/neu-ui-no-fonts.css";
```

它提供核心样式、旧变量/旧 class 兼容层、正文排版和代码高亮样式，但不会导入 `fonts.css`，因此不会在 Vite 构建中触发 `@fontsource/noto-sans-sc` 的字体分片打包。

当前导入链路是：

```css
/* neu-ui.css */
@import "./fonts.css";
@import "./legacy.css";
@import "./content.css";
@import "./highlight.css";
```

```css
/* neu-ui-no-fonts.css */
@import "./legacy.css";
@import "./content.css";
@import "./highlight.css";
```

而 `legacy.css` 自带：

```css
@import "./core.css";
```

这样做的目的，是让单独导入 `legacy.css` 的迁移项目也能拿到必要的 tokens、base、utilities 和 components。

## 兼容层提供什么

`legacy.css` 保留的是旧 CSS contract，不恢复旧全局副作用。

它提供：

- 旧变量桥接，例如 `--bg-color`、`--text-main`、`--text-sub`、`--color-primary`、`--shadow-light`、`--shadow-dark`。
- 旧动效、圆角、字体变量桥接，例如 `--ease-smooth`、`--duration-normal`、`--font-sans`、`--font-mono`。
- `html.dark`、`body.dark-mode`、`.dark-mode` 暗色兼容。
- 旧尺寸别名，例如 `.neu-btn-sm`、`.neu-btn-lg`、`.neu-tag-sm`、`.neu-tag-lg`。
- 常见旧 class，例如 `.neu-title`、`.neu-text-sub`、`.neu-pressed`、`.neu-code-block`、`.neu-dropdown-menu`、`.neu-badge`。

它不恢复：

- 隐藏全局滚动条。
- 全局 `outline: none`。
- 对 `body`、`html` 或 `*` 的大范围 reset。
- 固定导航等页面级副作用。

## 非 Vue 项目的消费方式

非 Vue 项目推荐在自己的构建入口中 import npm 包 CSS，然后把结果打包进自己的静态产物。

示例：

```css
@import "@healock/neumorphism-ui/neu-ui-no-fonts.css";
@import "./common/index.css";
@import "./theme/index.css";
```

运行时页面只加载本项目构建后的 CSS：

```html
<link rel="stylesheet" href="/assets/dist/css/main.css">
```

这样生产环境不会直接依赖远程可变 CSS，也不需要引入 Vue runtime。

## HTML class contract 示例

Vue 组件输出和普通 HTML 模板可以共享同一套 class contract。

按钮：

```html
<a class="neu-btn neu-size--sm" href="/">返回首页</a>
<a class="neu-btn neu-btn-sm" href="/">旧尺寸别名，迁移期可用</a>
```

卡片：

```html
<article class="neu-card neu-surface--flat neu-size--md">
  内容
</article>
```

导航 pill：

```html
<nav class="neu-nav-pills" aria-label="主导航">
  <div class="neu-nav-pills__list">
    <a class="neu-nav-pill is-active" href="/" aria-current="page">首页</a>
    <a class="neu-nav-pill" href="/archives">归档</a>
  </div>
</nav>
```

正文：

```html
<article class="neu-content">
  <h1>文章标题</h1>
  <p>正文内容。</p>
</article>
```

## 职责边界

可以共享：

- CSS tokens
- 通用 class 命名
- 阴影、圆角、动效曲线
- Button、Card、Navbar、NavPills、Input、Tag、Content 等视觉样式
- 暗色模式变量

不共享：

- Vue props
- Vue Router
- Vue lifecycle
- Composition API
- 服务端模板数据逻辑
- 具体 CMS / Halo 的菜单、配置和运行时对象

## 当前风险与后续方向

现在的策略能替代旧 CDN 的主要生产依赖，但还有两个边界需要保持清醒：

1. 同一个 npm 包同时包含 Vue 组件和 CSS runtime。CSS-only 项目安装它时，构建期仍会安装组件依赖；运行时不会加载 Vue，除非项目自己 import JS。
2. `neu-ui.css` / `neu-ui-no-fonts.css` 是迁移入口，不是新项目默认最佳入口。新项目更推荐模块化入口。
3. npm CSS exports 面向 Vite、PostCSS 等构建期消费；未来如果发布版本化 CDN，需要单独产出浏览器可直接 `<link>` 的构建后 CSS，并处理字体文件路径，不能简单把源码入口原样当作 CDN 成品。

如果未来 CSS-only 消费方越来越多，可以考虑新增一个独立的 CSS-only 包，例如 `@healock/neumorphism-css`，但 v1 beta 阶段先用同包 CSS exports 保持维护成本最低。
