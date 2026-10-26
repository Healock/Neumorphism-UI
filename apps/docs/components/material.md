# Material 外壳与反馈

这一组把应用外壳与即时反馈收进同一套 neumorphic 表面：顶部应用栏、底部导航、侧边栏、抽屉、搜索、FAB action wheel、Snackbar、chip、底部弹层与圆环进度。

已存在的基础控件在 Material 语境下的映射：

| Material 名称 | 本包组件 |
| --- | --- |
| Dialog | `NeuModal` |
| Menu | `NeuDropdown` / `NeuDropdownItem` |
| Tooltip | `NeuTooltip` |
| Linear progress | `NeuProgress` |
| Radio / Checkbox / Switch / Slider / Segmented | 同名组件 |

## 应用外壳

```vue
<NeuAppBar title="素材工作台" subtitle="最近同步 2 分钟前">
  <template #leading>
    <NeuNavigationDrawer v-model:open="drawerOpen" v-model="section" :items="navItems" title="素材导航">
      <template #trigger>
        <NeuButton aria-label="打开导航抽屉">☰</NeuButton>
      </template>
    </NeuNavigationDrawer>
  </template>
  <template #actions>
    <NeuButton variant="primary">发布</NeuButton>
  </template>
</NeuAppBar>

<NeuTabBar v-model="tab" :items="tabItems" label="素材分区" />
<NeuNavigationBar v-model="section" :items="navItems" />
<NeuBottomAppBar>
  <template #actions>
    <NeuButton>撤销</NeuButton>
    <NeuButton>重做</NeuButton>
  </template>
</NeuBottomAppBar>
```

`NeuNavigationRail` 是纵向导航，`#fab` 可放一个浮动操作；`NeuSearchBar` 是真实的 `role="search"` 表单，支持 `v-model`、`submit`、`clear`。

## 导航与搜索

```vue
<NeuNavigationRail v-model="section" :items="railItems">
  <template #fab><NeuButton size="sm" aria-label="新建">+</NeuButton></template>
</NeuNavigationRail>

<NeuSearchBar v-model="query" label="搜索组件" placeholder="搜索组件、颜色或文件…" @submit="search" />
```

`NeuSearchBar` 的清除按钮只在有值时出现；按 Enter 会触发 `submit`，不会刷新页面。

## FAB action wheel

`NeuFab` 的主按钮展开环形动作。每个动作按角度均匀分布，并按序号错峰出现；再次点击、选择动作或打开弹层时收回。

```vue
<NeuFab
  v-model="fabOpen"
  label="快速操作"
  :actions="[
    { value: 'note', label: '新建笔记', icon: '✎' },
    { value: 'upload', label: '上传文件', icon: '↥' },
    { value: 'share', label: '分享', icon: '↗' },
  ]"
  @select="handleAction"
/>
```

`label` 同时作为菜单的可访问名；动作按钮使用 `role="menuitem"`，`aria-expanded` 反映开关状态。CSS 变量 `--neu-fab-radius` 可调整环半径；`prefers-reduced-motion` 下动作直接落位。

## 反馈

```vue
<NeuSnackbar v-model:open="snackOpen" message="已保存到草稿" action-label="撤销" @action="undo" />
<NeuChip v-model:selected="filterOn" variant="filter">最近更新</NeuChip>
<NeuCircularProgress :value="68" label="同步进度" />
<NeuCircularProgress indeterminate label="正在加载" :show-value="false" />
```

`NeuBottomSheet` 与 `NeuNavigationDrawer` 都由 Reka UI Dialog 承载，自动处理焦点陷阱、Escape 与返回焦点。

```vue
<NeuBottomSheet v-model:open="sheetOpen" title="选择导出格式" description="保留当前页面上下文。">
  <template #trigger><NeuButton>打开 BottomSheet</NeuButton></template>
  <NeuButton class="sheet-option">PNG · 2×</NeuButton>
  <template #footer>
    <NeuButton @click="sheetOpen = false">取消</NeuButton>
    <NeuButton variant="primary" @click="confirm">导出</NeuButton>
  </template>
</NeuBottomSheet>
```

底部弹层和抽屉都建议提供 `title`；没有 `description` 时会自动补一个仅读屏可见的描述，避免 Reka 的无障碍警告。
