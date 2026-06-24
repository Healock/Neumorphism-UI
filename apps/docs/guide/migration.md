# 旧版迁移

1.x 可临时导入：

```ts
import '@healock/neumorphism-ui/legacy.css'
```

主要 `.neu-*` 类仍可使用，但全局滚动条隐藏、`outline: none` 和自动修改 `body` 的行为已删除。`body.dark-mode` 仅在兼容入口保留，并计划最早于 2.0 移除。
