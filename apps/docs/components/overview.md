# 组件总览

v1 包含 Button、Card、Input、Textarea、Switch、Checkbox、Radio、Tag、Avatar、Alert、Progress、Pagination、Tabs、Dropdown、Navbar 和 NavPills。

表单统一使用 `modelValue`；Pagination 使用 `v-model:page`，Dropdown 使用 `v-model:open`。

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
