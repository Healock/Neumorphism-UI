# 组件总览

当前包内提供 40 多个可组合原语：Button、Card、Input、Textarea、Switch、Checkbox、Radio、Tag、Avatar、Alert、Progress、Pagination、Tabs、Dropdown、Navbar、NavPills，以及 Select、Accordion、Modal、Tooltip、Segmented、Slider、Skeleton、Breadcrumb、EmptyState。Material 外壳组件 AppBar、BottomAppBar、TabBar、NavigationBar、NavigationRail、NavigationDrawer、SearchBar、Fab、Snackbar、Chip、BottomSheet、CircularProgress 见 [Material 外壳](/components/material)。动效组件 `NeuTransition`、`NeuReveal` 与配套 CSS 工具类见[动效](/motion)。

表单统一使用 `modelValue`；Pagination 使用 `v-model:page`，Dropdown 使用 `v-model:open`，Modal 使用 `v-model:open`。Pagination 在 5 页以内保持页码稳定，选中态使用可滑动的胶囊指示器；更多页数时按当前页保留邻近窗口。

```vue
<NeuTabs
  v-model="tab"
  :items="[
    { value: 'profile', label: '资料' },
    { value: 'security', label: '安全' },
  ]"
>
  <NeuTab value="profile">资料内容</NeuTab>
  <NeuTab value="security">安全设置</NeuTab>
</NeuTabs>
```

Tabs 和 Dropdown 的键盘操作、焦点管理与 ARIA 语义由 Reka UI 提供。Navbar 不依赖 Vue Router，默认使用静态定位；图标通过 slots 传入。

`NeuNavPills` 用于站点导航里的胶囊链接，默认渲染真实 `<a>`，不绑定 Vue Router。当前项会自动获得 `aria-current="page"`，并带有小菱形标记。

```vue
<NeuNavPills
  model-value="motion"
  :items="[
    { value: 'overview', label: '首页', href: '/' },
    { value: 'components', label: '组件', href: '/components' },
    { value: 'motion', label: '动效', href: '/motion' },
  ]"
/>
```

## Select、Segmented 与 Slider

`NeuSelect` 接收 `items: { value, label, disabled? }[]`，支持 `label`、`placeholder`、`size` 和 `#empty`。`NeuSegmented` 是原生 radio group，`NeuSlider` 是原生 range，都会发出 `update:modelValue` 与 `change`。

```vue
<NeuSelect v-model="framework" label="运行环境" :items="frameworks" />
<NeuSegmented v-model="density" label="界面密度" :items="densities" />
<NeuSlider v-model="radius" label="圆角" :min="8" :max="48" :step="2" />
```

## Accordion

`NeuAccordion` 支持 `type="single"`（默认）和 `type="multiple"`；`v-model` 在 single 下是字符串，在 multiple 下是字符串数组。每项可传 `content`，也可用与 `value` 同名的 slot 放入富内容。

```vue
<NeuAccordion
  v-model="openPanel"
  type="single"
  :items="[
    { value: 'tokens', title: '为什么用 tokens？', content: '颜色、圆角与动效共用变量。' },
    { value: 'a11y', title: '键盘支持？', content: '焦点管理由 Reka UI 提供。' },
  ]"
/>
```

## Modal 与 Tooltip

`NeuModal` 由 `DialogRoot` 承载，支持 `#trigger`、默认 slot 与 `#footer`；没有 `title` 时会渲染隐藏的可访问名。`NeuTooltip` 用 `#trigger` 包住触发元素，内容可用 `content` 或默认 slot。

```vue
<NeuModal v-model:open="open" title="邀请协作者" description="发送一封邀请邮件。">
  <template #trigger><NeuButton>打开</NeuButton></template>
  <p>邀请会在 7 天后过期。</p>
  <template #footer>
    <NeuButton @click="open = false">取消</NeuButton>
  </template>
</NeuModal>

<NeuTooltip content="提示内容">
  <template #trigger><NeuButton>悬停</NeuButton></template>
</NeuTooltip>
```

## Breadcrumb、EmptyState 与 Skeleton

`NeuBreadcrumb` 的最后一项默认获得 `aria-current="page"`；`NeuEmptyState` 提供 `#icon`、`#title`、`#description` 和默认 actions slot。`NeuSkeleton` 是装饰性占位，默认 `aria-hidden="true"`，支持 `lines`、`shape` 与 `animated`。

```vue
<NeuBreadcrumb :items="[{ label: '组件', href: '/components' }, { label: '选择器' }]" />

<NeuEmptyState title="还没有文件" description="拖入文件或从模板开始。">
  <NeuButton variant="primary" size="sm">上传</NeuButton>
</NeuEmptyState>

<NeuSkeleton :lines="3" />
```

Select、Accordion、Modal 与 Tooltip 的键盘/读屏语义由 Reka UI 提供；Segmented 与 Slider 保留原生控件语义。所有新组件复用 `--neu-duration-*`、`--neu-ease*` 与 `prefers-reduced-motion` 约定。
