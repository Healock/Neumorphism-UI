# Demo 多页面切换问题复盘

本文记录 `registry-consumer-check` demo 在多页面切换、View Transition、字体和 SSR/SSG 首屏上的问题、尝试方案和当前结论。

## 背景目标

`@healock/neumorphism-ui` 的 demo 不只是组件陈列页，它还承担“真实项目消费验证”的职责：

- 从 registry/tarball 安装组件库，而不是直接引用源码。
- 使用 Vite + Vue，模拟业务项目。
- 保留 `/`、`/components`、`/motion`、`/release` 这些真实路径。
- 硬刷新、复制 URL、禁用增强脚本时仍然能打开对应页面。
- 尽量验证组件库在多 HTML 页面中的 CSS、字体、主题和交互动效表现。

用户期望的切换观感接近 `healock.cc`：页面之间连续、丝滑，不出现白屏、兜底背景、裸 HTML 或突兀硬切。

## 试过的方案

### 1. Hash 路由

早期 demo 使用类似 `/#components`、`/#motion` 的形式。这种方式本质上仍是单页应用状态切换，不是真正多页面。

问题：

- 不能验证真实多 HTML 页面。
- URL 语义不符合用户预期。
- 对组件库“被别的项目直接套用”的验证价值有限。

处理：

- 改成 `/components`、`/motion`、`/release` 真实路径。

### 2. 纯原生跨文档 View Transition

使用：

```css
@view-transition {
  navigation: auto;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.4s;
  animation-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
}
```

优点：

- 技术形式最接近传统多页面跳转。
- 不需要拦截所有链接。
- 硬刷新和普通导航语义自然保留。

遇到的问题：

- 新页面如果还没完成首屏样式，就会在转场中出现裸 HTML。
- 如果新页面只有背景但内容没来得及渲染，会出现“原网页 -> 兜底背景 -> 新网页”的感觉。
- 浏览器对跨文档 View Transition 是 best-effort，并非每次导航都保证同样稳定。
- Vite dev server 下首屏资源时序比生产站点更松散，更容易暴露白屏或插帧。

### 3. 预加载页面和资源

尝试提前 warmup 站内 HTML、脚本、CSS 和部分字体资源。

有效点：

- 可以降低目标页面冷加载概率。
- 对重复访问页面有帮助。

局限：

- 预加载不是核心解法，只是降低失败概率。
- 如果架构上新页面首屏本来就依赖客户端挂载，仍可能拍到空内容。
- 针对具体中文文案预热字体分片不通用，不适合作为组件库策略。

### 4. SSR/SSG 式首屏注入

增加：

- `src/create-demo-app.ts`
- `src/entry-server.ts`
- `scripts/prerender.mjs`
- `vite.config.ts` 中的 transform

目标是把 Vue 首屏 HTML 注入到每个入口的 `<div id="app">` 中。

有效点：

- 新页面快照不再只拍到空 `#app`。
- 比纯客户端挂载更接近 `healock.cc` / Halo 这类服务端输出完整 HTML 的站点。

局限：

- 这只是 demo 的预渲染/SSG 风格，不是完整 Node SSR 服务。
- dev server 和生产构建的资源时序仍可能不同。

### 5. 阻塞关键 CSS

将 `src/demo-critical.css` 通过每个 HTML 的 head 加载，而不是只依赖 JS 入口 import。

有效点：

- 避免新页面快照拍到无样式 HTML。
- 让跨文档 View Transition 抓取到的 old/new 两张快照更稳定。

代价：

- demo 站点 CSS 边界变重，`App.vue` 之外仍需要站点级样式。
- 这部分不应直接视为组件库公共 API。

### 6. 字体策略

用户期望“中文字只加载 Noto Sans”，也就是不要先显示微软雅黑再切换。

当前 demo 使用阻塞字体入口，让首屏尽量直接使用 Noto Sans SC。

组件库默认仍应该更通用：

- `fonts.css` 使用 `font-display: swap`，避免业务项目被字体阻塞。
- `fonts-block.css` 可作为需要强一致首屏字体的可选入口。

结论：

- demo 可以为了视觉验收使用 blocking 字体。
- 组件库不应默认强制所有项目阻塞中文字体加载。
- 不应为某个 demo 文案硬编码预热 Noto Sans SC 的具体 unicode 分片。

### 7. 仿 Halo 骨架

对比仪表盘式 demo 后，仿 Halo 的页面结构更丝滑：

- 首页：大 hero + 瀑布流卡片。
- 内页：文章 header + 内容卡片 + 侧边目录。
- 页面之间有类似的背景、容器宽度和纵向层级。

有效点：

- 页面几何连续性更好。
- View Transition 的 root crossfade 不会从“控制台布局”突然切到“文章布局”。
- 视觉上更接近 `healock.cc` 的站点形态。

局限：

- 这只是 demo 骨架，不是组件库公共 API。
- 它改善观感，但不能完全保证原生跨文档转场每次都触发。

### 8. 压平转场期间的新拟态阴影

新拟态大量使用浅色外阴影和深色外阴影。两张页面快照 crossfade 时，浅色阴影可能叠加成异常白光。

处理：

- old/new root 快照设置 `mix-blend-mode: normal`。
- 设置稳定背景色。
- 点击站内链接前写入 `sessionStorage` 标记。
- 新页面 head 里的早期脚本读取标记并添加 `html.neu-vt-flatten`。
- `document-transition.css` 在 `neu-vt-flatten` 状态下临时压低组件阴影。

有效点：

- 明显减少白色光晕。

局限：

- 这是 demo 的视觉修正，不是浏览器级保证。
- 如果页面中有新的强发光/大阴影元素，还需要继续纳入 flatten 规则。

## 关键问题与对应处理

| 问题 | 原因判断 | 当前处理 |
| --- | --- | --- |
| 切换中白屏 | 新页面首屏内容或样式未进入快照 | SSR/SSG 首屏注入 + 阻塞关键 CSS |
| 出现裸 HTML | CSS 由 JS 入口加载太晚 | HTML head 直接加载 `demo-critical.css` |
| 出现兜底背景帧 | 新旧页面结构差异大或目标页面内容未稳定 | 恢复仿 Halo 骨架，保留预加载但不依赖它 |
| 字体先显示微软雅黑 | Noto Sans SC 未在首屏前可用 | demo 使用 blocking 字体入口；组件库保留通用 swap 入口 |
| 切换时白色光晕 | 新拟态浅色阴影在快照 crossfade 中叠加 | `mix-blend-mode: normal` + `neu-vt-flatten` |
| 动画偶尔不触发 | 原生跨文档 View Transition 是 best-effort，且 dev server 时序不稳定 | 接受该限制；若必须稳定，未来考虑 enhanced MPA |
| 仪表盘 demo 不丝滑 | 页面几何差异过大 | 当前恢复仿 Halo 页面结构 |

## 当前采用的方案

现在 demo 暂定为：

1. 真实多 HTML 入口仍保留。
2. 页面布局恢复为仿 Halo 骨架，便于继续做视觉反馈。
3. 首屏通过 SSR/SSG 式方式注入。
4. `demo-critical.css` 阻塞加载，避免无样式快照。
5. `document-transition.css` 使用最小 root crossfade。
6. `document-transition.ts` 做站内资源 warmup 和转场前 flatten 标记。
7. 组件库继续提供通用组件、tokens、utilities、字体入口和可选 `view-transition.css`，不默认提供整套 Halo 风格页面模板。

## 为什么它仍然不像 healock.cc 那么稳定

基于当前观察，差异主要来自前端架构和运行环境：

- `healock.cc` 是 Halo 博客主题，页面天然由服务端输出完整 HTML。
- 生产站点资源缓存更稳定，CSS、字体和图片更容易在导航前命中缓存。
- 页面结构相似，跨页面几何连续性更好。
- demo 在 Vite dev server 下运行，模块、CSS、字体的加载时序更容易抖动。
- 原生跨文档 View Transition 本身不是强制每次导航都一致触发的动画系统。

因此，目前不把“100% 等同 healock.cc 的丝滑程度”作为这个 demo 阶段的验收标准。

## 如果未来要追求更稳定的点击转场

可选方案有三类：

### 方案 A：保持纯 MPA，继续优化首屏

继续保留真实多 HTML，不拦截链接。

优点：

- 最接近传统页面语义。
- 禁用 JS 也可访问。

风险：

- 跨文档 View Transition 仍然可能偶发硬切。
- 对资源时序和浏览器实现比较敏感。

### 方案 B：增强 MPA

点击站内导航时拦截普通左键链接，使用 History API + Vue 状态切换 + `document.startViewTransition()`；硬刷新和复制 URL 仍回到真实 HTML 页面。

优点：

- 点击导航的动画可控性最高。
- 不容易出现白屏、裸 HTML 或 fallback frame。

风险：

- 技术形式不再是纯跨文档 MPA。
- 需要维护链接拦截、popstate、reduced motion、中键/Ctrl/Cmd 点击等边界。
- 对组件库而言只能作为可选增强，不能默认接管业务项目导航。

### 方案 C：真正 SSR demo

做一个 Node SSR demo server，而不是 Vite 预渲染式 dev demo。

优点：

- 更接近 Halo / 生产站点输出完整 HTML 的形式。
- 可以更真实地验证多页面首屏。

风险：

- demo 复杂度明显上升。
- 对组件库发布验证而言可能过重。

## 组件库层面的沉淀建议

短期不建议把 demo 的整套页面 CSS 移进组件库。更稳的沉淀顺序是：

1. 保留 `view-transition.css` 作为可选入口。
2. 提供更通用的 motion tokens 和 shadow flatten tokens。
3. 如果多个项目需要，再提供 `NeuNavPills` 或 `.neu-nav-pills`。
4. 如果组件库定位扩展到主题模板层，再考虑 `NeuSiteShell`、`NeuArticleLayout`。
5. 如果用户明确需要稳定点击转场，再提供 `useNeuEnhancedNavigation()`，但必须默认关闭。

## 剩余不确定性

我不认为当前策略能“事实 100% 保证”所有浏览器、所有网络状态、所有 dev/prod 时序下都和 `healock.cc` 一样丝滑。已知漏洞包括：

- 浏览器可能不触发跨文档 View Transition。
- 首次冷加载字体和资源仍可能慢于快照时机。
- 新增大阴影组件后可能再次出现白光，需要补充 flatten 规则。
- Vite dev server 的表现不能完全代表生产静态部署。
- 不同 Chromium 版本、系统字体缓存状态和显卡合成路径可能影响观感。

可修复方向：

- 要“点击必定丝滑”：采用增强 MPA。
- 要“多 HTML 首屏更像生产”：做真实 SSR demo 或静态构建后用静态服务器验收。
- 要“发布级视觉证据”：用 Playwright 对生产构建录制导航过程，并保留截图/视频作为验收附件。

当前选择是务实折中：先恢复仿 Halo 骨架，让 demo 继续服务于视觉反馈和组件消费验证；等组件库样式稳定后，再决定是否投入增强 MPA 或 SSR demo。
