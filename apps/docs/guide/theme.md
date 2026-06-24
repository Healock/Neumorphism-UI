# 主题

`NeuThemeProvider` 支持 `light`、`dark` 和 `system`：

```vue
<NeuThemeProvider mode="system" :tokens="{ primary: '#247a5d' }">
  <App />
</NeuThemeProvider>
```

Provider 默认将 `data-neu-theme` 与覆盖变量写到根元素，使 Teleport 浮层保持同一主题。
