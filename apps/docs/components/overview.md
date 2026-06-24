# 组件总览

v1 包含 Button、Card、Input、Textarea、Switch、Checkbox、Radio、Tag、Avatar、Alert、Progress、Pagination、Tabs、Dropdown 和 Navbar。

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
