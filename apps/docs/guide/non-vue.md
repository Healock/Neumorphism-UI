# 非 Vue / Halo 使用

`@healock/neumorphism-ui` 的 CSS runtime 可以在非 Vue 环境中使用。普通 HTML、Thymeleaf、Halo 主题这类项目不需要引入 Vue runtime，只需要在构建期导入 CSS。

## 推荐导入

新项目优先使用模块化入口：

```css
@import "@healock/neumorphism-ui/tokens.css";
@import "@healock/neumorphism-ui/base.css";
@import "@healock/neumorphism-ui/utilities.css";
@import "@healock/neumorphism-ui/components.css";
```

可选导入正文、代码高亮和页面转场样式：

```css
@import "@healock/neumorphism-ui/content.css";
@import "@healock/neumorphism-ui/highlight.css";
@import "@healock/neumorphism-ui/view-transition.css";
```

如果要替代历史 CDN `neu-ui.css`，迁移期可以使用完整兼容入口：

```css
@import "@healock/neumorphism-ui/neu-ui.css";
```

这个入口会导入 `fonts.css`。如果宿主项目已经管理字体，或者不希望 Vite 把 Noto Sans SC 字体分片打入产物，使用不带字体的完整聚合入口：

```css
@import "@healock/neumorphism-ui/neu-ui-no-fonts.css";
```

## 构建期消费

主题或静态站点可以在自己的 CSS 入口中导入组件库样式：

```css
@import "@healock/neumorphism-ui/neu-ui-no-fonts.css";
@import "./common/index.css";
@import "./theme/index.css";
```

然后由自己的构建工具输出最终 CSS。运行时只加载项目自己的构建产物，不需要请求远程 CDN CSS，也不需要 Vue。

## HTML class contract

Vue 项目和非 Vue 模板共享的是 CSS class contract，不共享 Vue props、路由或生命周期。

```html
<a class="neu-btn neu-size--sm" href="/">按钮</a>

<article class="neu-card neu-surface--flat neu-size--md">
  卡片内容
</article>

<nav class="neu-nav-pills" aria-label="主导航">
  <div class="neu-nav-pills__list">
    <a class="neu-nav-pill is-active" href="/" aria-current="page">首页</a>
    <a class="neu-nav-pill" href="/archives">归档</a>
  </div>
</nav>
```

## 兼容入口保留什么

`neu-ui.css` 和 `neu-ui-no-fonts.css` 都会通过 `legacy.css` 保留常见旧变量和旧 class，例如：

- `--bg-color`
- `--text-main`
- `--text-sub`
- `--color-primary`
- `html.dark`
- `body.dark-mode`
- `.neu-btn-sm`
- `.neu-title`
- `.neu-text-sub`

但它不会恢复旧版本的全局滚动条隐藏、全局 `outline: none` 或固定导航等页面级副作用。

## 取舍

`neu-ui.css` 适合需要组件库同时提供字体的迁移旧项目；`neu-ui-no-fonts.css` 适合已有字体策略的服务端模板或静态站点。新项目仍更推荐模块化入口。

如果未来非 Vue 消费方很多，可以再考虑独立 CSS-only 包。当前 v1 beta 阶段，组件库先通过同一个 npm 包提供 CSS exports，保持源头统一。
