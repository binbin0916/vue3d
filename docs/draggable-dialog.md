# 自定义可拖拽 Dialog 设计稿

> 基于 Element Plus 设计规范，支持拖拽移动、缩放、多层嵌套

---

## 设计理念

**轻量级模态面板** — 不阻断用户操作流，支持拖拽调整位置和大小，适合 3D 查看器中需要同时操作模型和面板的场景。

---

## 布局结构

```
┌─────────────────────────────────────────────┐
│  标题栏                           [_] [□] [×]│
├─────────────────────────────────────────────┤
│                                             │
│              内容区域（Content）              │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│              操作栏（Footer）                │
└─────────────────────────────────────────────┘
       ↕ 可拖拽底部边缘调整高度
  ↔ 可拖拽右侧边缘调整宽度
  ↗ 可拖拽右下角同时调整宽高
```

---

## 尺寸规范

### 默认尺寸

| 属性 | 值 | 说明 |
|------|-----|------|
| 最小宽度 | `320px` | 防止内容过窄 |
| 最大宽度 | `calc(100vw - 48px)` | 两侧各留 24px 边距 |
| 最小高度 | `200px` | 防止内容过矮 |
| 最大高度 | `calc(100vh - 96px)` | 上下各留 48px 边距 |
| 默认宽度 | `520px` | 常规对话框 |
| 默认高度 | 自适应内容 | 由内容撑开 |

### 预设尺寸（可选）

| 名称 | 宽度 | 用途 |
|------|------|------|
| `small` | `420px` | 简单确认框 |
| `default` | `520px` | 常规对话框 |
| `large` | `720px` | 复杂表单 |
| `fullscreen` | `100vw - 48px` | 全屏展示 |

---

## 色彩方案（Element Plus）

### 浅色主题

| 用途 | 变量 | 色值 |
|------|------|------|
| 遮罩层 | `--el-overlay-color` | `rgba(0, 0, 0, 0.5)` |
| 面板背景 | `--el-bg-color` | `#ffffff` |
| 标题栏背景 | — | `#fafafa` |
| 标题文字 | `--el-text-color-primary` | `#303133` |
| 内容文字 | `--el-text-color-regular` | `#606266` |
| 边框色 | `--el-border-color-lighter` | `#e4e7ed` |
| 关闭按钮 hover | `--el-color-danger` | `#F56C6C` |
| 圆角 | `--el-dialog-border-radius` | `4px` |
| 阴影 | `--el-dialog-box-shadow` | `0 2px 12px 0 rgba(0,0,0,.1)` |

---

## 交互行为

### 拖拽移动

| 行为 | 说明 |
|------|------|
| 拖拽区域 | 标题栏（header） |
| 拖拽光标 | `cursor: move` |
| 拖拽边界 | 不超出视口，保留 24px 边距 |
| 双击标题栏 | 切换最大化/还原 |
| 拖拽时 | 面板添加 `transition: none`，松开后恢复 |

### 缩放

| 行为 | 说明 |
|------|------|
| 缩放手柄 | 右下角 16px 区域 |
| 缩放光标 | `cursor: nwse-resize` |
| 最小尺寸 | 320px × 200px |
| 缩放时 | 实时更新 width/height，禁止文本选中 |

### 键盘支持

| 按键 | 行为 |
|------|------|
| `Escape` | 关闭对话框 |
| `Tab` | 焦点在对话框内循环 |
| `Enter` | 确认操作（聚焦在确认按钮时） |

---

## 组件接口

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `boolean` | `false` | 控制显示/隐藏（v-model） |
| `title` | `string` | `''` | 标题文本 |
| `width` | `string \| number` | `'520px'` | 初始宽度 |
| `top` | `string` | `'15vh'` | 初始垂直位置 |
| `modal` | `boolean` | `true` | 是否显示遮罩层 |
| `modalClickClose` | `boolean` | `true` | 点击遮罩层是否关闭 |
| `draggable` | `boolean` | `true` | 是否可拖拽 |
| `resizable` | `boolean` | `true` | 是否可缩放 |
| `closeOnPressEscape` | `boolean` | `true` | 按 ESC 是否关闭 |
| `showClose` | `boolean` | `true` | 是否显示关闭按钮 |
| `destroyOnClose` | `boolean` | `false` | 关闭时销毁内容 |
| `appendToBody` | `boolean` | `true` | 是否追加到 body |
| `zIndex` | `number` | `2000` | 层级 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:modelValue` | `boolean` | 显示状态变化 |
| `open` | — | 打开时触发 |
| `opened` | — | 打开动画结束后触发 |
| `close` | — | 关闭时触发 |
| `closed` | — | 关闭动画结束后触发 |
| `dragStart` | `{ x: number, y: number }` | 开始拖拽 |
| `dragEnd` | `{ x: number, y: number }` | 结束拖拽 |
| `resize` | `{ width: number, height: number }` | 缩放时触发 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| `default` | 内容区域 |
| `header` | 标题栏自定义 |
| `footer` | 底部操作栏 |

---

## 视觉示意

```
默认状态：
┌──────────────────────────────────────┐
│  对话框标题                      [—][□][×] │
├──────────────────────────────────────┤
│                                      │
│          这里是内容区域               │
│                                      │
├──────────────────────────────────────┤
│          [取消]  [确定]              │
└──────────────────────────────────────┘

拖拽时：
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
  ┌──────────────────────────────────┐
│ │  对话框标题                  [—][□][×] │
  ├──────────────────────────────────┤
│ │          这里是内容区域           │
  ├──────────────────────────────────┤
│ │          [取消]  [确定]          │
  └──────────────────────────────────┘
└ ─ ─ ─ ─ ─ 虚线表示原始位置 ─ ─ ─ ─ ┘

最大化：
┌──────────────────────────────────────┐
│  对话框标题                      [—][□][×] │
├──────────────────────────────────────┤
│                                      │
│                                      │
│          这里是内容区域               │
│                                      │
│                                      │
├──────────────────────────────────────┤
│          [取消]  [确定]              │
└──────────────────────────────────────┘
```

---

## 动效

| 元素 | 动效 | 时长 | 缓动 |
|------|------|------|------|
| 遮罩层淡入 | `opacity 0 → 0.5` | 200ms | `ease` |
| 遮罩层淡出 | `opacity 0.5 → 0` | 200ms | `ease` |
| 面板进入 | `scale(0.95) + opacity(0)` → `scale(1) + opacity(1)` | 250ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| 面板离开 | `scale(1) + opacity(1)` → `scale(0.95) + opacity(0)` | 200ms | `ease-in` |
| 拖拽移动 | `transition: none`（拖拽时禁止过渡） | — | — |
| 缩放 | `transition: none`（缩放时禁止过渡） | — | — |

---

## 响应式行为

| 视口宽度 | 行为 |
|----------|------|
| ≥ 768px | 正常显示，可拖拽缩放 |
| < 768px | 自动全屏（宽度 100vw - 16px，高度 100vh - 16px），禁止缩放 |

---

## 实现要点

### 拖拽实现

```ts
// 核心逻辑
onHeaderMouseDown(e) {
  startX = e.clientX - dialogLeft
  startY = e.clientY - dialogTop
  isDragging = true
  // 禁用过渡动画
  dialogStyle.transition = 'none'
}

onMouseMove(e) {
  if (!isDragging) return
  dialogLeft = clamp(e.clientX - startX, minLeft, maxLeft)
  dialogTop = clamp(e.clientY - startY, minTop, maxTop)
}

onMouseUp() {
  isDragging = false
  // 恢复过渡动画
  dialogStyle.transition = ''
}
```

### 缩放实现

```ts
// 右下角拖拽
onResizeMouseDown(e) {
  startX = e.clientX
  startY = e.clientY
  startWidth = dialogWidth
  startHeight = dialogHeight
  isResizing = true
}

onMouseMove(e) {
  if (!isResizing) return
  dialogWidth = clamp(startWidth + (e.clientX - startX), minWidth, maxWidth)
  dialogHeight = clamp(startHeight + (e.clientY - startY), minHeight, maxHeight)
}
```

### 层级管理

```ts
// 多个 Dialog 同时打开时，最后打开的在最上层
let globalZIndex = 2000

function bringToFront() {
  dialogZIndex = ++globalZIndex
}
```

---

## 与现有项目的集成

### 在 ToolBar 中使用

```vue
<template>
  <DraggableDialog v-model="visible" title="设置" width="480px">
    <div>设置内容...</div>
    <template #footer>
      <button @click="visible = false">取消</button>
      <button @click="save">保存</button>
    </template>
  </DraggableDialog>
</template>
```

### 在工具 handler 中使用

```ts
// src/tools/settings.ts
export const openSettings: ToolHandler = (ctx) => {
  // 通过 eventBus 或 store 触发 Dialog 显示
  emit('open-dialog', 'settings')
}
```
