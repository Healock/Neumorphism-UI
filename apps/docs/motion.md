# 动效

动效层分为两部分：可以直接消费的 CSS 工具类，以及需要 Vue 编排时使用的 `NeuTransition`、`NeuReveal`。所有时长、缓动和位移都复用 tokens；开启 `prefers-reduced-motion` 时，内容直接落到终态。

## 引入

`core.css` 已包含动效层，使用完整样式入口时不需要额外引入：

```ts
import '@healock/neumorphism-ui/style.css'
```

只想要动效、或已经在使用模块化 CSS 时，可以单独引入：

```ts
import '@healock/neumorphism-ui/motion.css'
```

## Tokens

| token | 默认值 | 用途 |
| --- | --- | --- |
| `--neu-motion-duration` | `var(--neu-duration-normal)` | 入场/揭示时长 |
| `--neu-motion-delay` | `0ms` | 延迟 |
| `--neu-motion-distance` | `1.25rem` | 位移距离 |
| `--neu-motion-scale` | `.94` | 缩放起点 |
| `--neu-motion-blur` | `12px` | 去焦起点 |
| `--neu-motion-stagger` | `90ms` | 错峰步长 |
| `--neu-motion-loop` | `4.2s` | 循环动效周期 |

## CSS 工具类

入场类可以单独使用，已经携带时长、延迟、缓动和 `both` 填充：

```html
<div class="neu-animate-fade-up">...</div>
<div class="neu-animate-pop-in neu-motion-fast neu-delay-2">...</div>
```

可用入场类：`neu-animate-fade-in`、`neu-animate-fade-up`、`neu-animate-fade-down`、`neu-animate-fade-left`、`neu-animate-fade-right`、`neu-animate-zoom-in`、`neu-animate-pop-in`、`neu-animate-blur-in`、`neu-animate-slide-right`。

| 类别 | 类名 |
| --- | --- |
| 时长 | `neu-motion-fast`、`neu-motion-normal`、`neu-motion-slow` |
| 缓动 | `neu-motion-spring`、`neu-motion-ease-out`、`neu-motion-ease-in-out`、`neu-motion-linear` |
| 延迟 | `neu-delay-1` 到 `neu-delay-6`（80–480ms） |
| 错峰 | `neu-stagger`，可叠加 `neu-stagger-fast` / `neu-stagger-slow` |
| 循环 | `neu-animate-float`、`neu-animate-pulse`、`neu-animate-breathe`、`neu-animate-wobble`、`neu-animate-shake` |
| 交互 | `neu-hover-lift`、`neu-press` |
| 占位 | `neu-shimmer` |

`neu-stagger` 会给前 12 个直接子元素写入递增的 `--neu-stagger-index`：

```html
<div class="neu-stagger">
  <div class="neu-animate-fade-up">一</div>
  <div class="neu-animate-fade-up">二</div>
  <div class="neu-animate-fade-up">三</div>
</div>
```

## NeuTransition

`NeuTransition` 是 Vue `<Transition>` 的预设包装，负责设置 CSS 变量并保留 Vue 的进出场生命周期。它支持 `preset`、`duration`、`delay`、`ease`、`appear`、`group`、`tag` 和 `mode`。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NeuTransition } from '@healock/neumorphism-ui'

const open = ref(true)
</script>

<template>
  <button @click="open = !open">切换</button>
  <NeuTransition preset="fade-up" :duration="360" :delay="80">
    <div v-if="open" class="neu-card">内容</div>
  </NeuTransition>
</template>
```

`preset` 可取 `fade`、`fade-up`、`fade-down`、`fade-left`、`fade-right`、`scale`、`blur`、`slide`、`slide-left`。`duration` 和 `delay` 接受毫秒数字、CSS 时间字符串，或 `fast` / `normal` / `slow`。

需要列表进出场时使用 `group`，并通过 `tag` 指定容器：

```vue
<NeuTransition group tag="ul" preset="fade-up" :duration="280">
  <li v-for="item in items" :key="item.id">{{ item.label }}</li>
</NeuTransition>
```

## NeuReveal

`NeuReveal` 用 `IntersectionObserver` 在元素进入视口时加 `is-visible`，并自动处理 SSR、无 `IntersectionObserver` 和 reduced-motion 场景。

```vue
<script setup lang="ts">
import { NeuReveal } from '@healock/neumorphism-ui'
</script>

<template>
  <NeuReveal preset="up" :delay="120" :duration="480">
    <article class="neu-card">滚动到这里时出现</article>
  </NeuReveal>
</template>
```

`preset` 可取 `fade`、`up`、`down`、`left`、`right`、`scale`、`blur`。`once` 默认为 `true`；设为 `false` 后离开视口会重新隐藏，再次进入时再次触发 `reveal`。`rootMargin` 和 `threshold` 会透传给 `IntersectionObserver`。

`disabled` 为 `true` 时直接显示，不创建观察器。

## 无障碍

- 新增动画必须尊重 `prefers-reduced-motion`；CSS 层会把动画和过渡压到 `.01ms` 并落到终态。
- 不要用动画隐藏唯一的内容或操作；`NeuReveal` 的初始隐藏只在客户端、且元素在视口外时启用。
- 循环动效只用于状态提示，不承载关键信息。
- 键盘焦点、`focus-visible` 和 `aria-*` 语义不由动效层改变。
