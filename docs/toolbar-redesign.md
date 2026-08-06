# 底部工具栏重设计方案

> 忽略现有排版与配色，基于当前功能结构重新设计

---

## 设计理念

**极简工业风** — 深色背景 + 高对比度文字 + 微妙的发光效果。工具栏作为 3D 查看器的控制面板，应退居次要位置，不抢夺模型的视觉焦点。

---

## 布局结构

```
┌──────────────────────────────────────────────────────────────────────┐
│  面包屑区域  │    工具按钮区域（可滚动）    │ 颜色选择器 │ 关闭 │
│  [菜单>材质] │  [线框] [X光] [法线] [纯色]  │ ● HEX #fff │  ×  │
└──────────────────────────────────────────────────────────────────────┘
```

- **单行布局**：所有元素水平排列，`flex-wrap: nowrap`
- **面包屑**：左侧固定区域，带竖线分隔
- **工具按钮**：中间自适应区域，内容溢出时水平滚动
- **颜色选择器**：右侧可选区域，仅在激活颜色工具时显示
- **关闭按钮**：最右侧固定区域

---

## 色彩方案

### 浅色主题（参考 Element Plus）

| 用途 | Element Plus 变量 | 色值 | 说明 |
|------|-------------------|------|------|
| 主色 | `--el-color-primary` | `#409EFF` | 品牌蓝，用于激活态 |
| 主文字 | `--el-text-color-primary` | `#303133` | 标题、重要文字 |
| 常规文字 | `--el-text-color-regular` | `#606266` | 正文、按钮标签 |
| 次要文字 | `--el-text-color-secondary` | `#909399` | 面包屑、辅助信息 |
| 占位文字 | `--el-text-color-placeholder` | `#C0C4CC` | 输入框占位符 |
| 禁用文字 | `--el-text-color-disabled` | `#C0C4CC` | 禁用状态 |
| 面板背景 | `--el-bg-color` | `#ffffff` | 纯白 |
| 页面背景 | `--el-bg-color-page` | `#f2f3f5` | 浅灰页面底色 |
| 边框色 | `--el-border-color` | `#dcdfe6` | 常规边框 |
| 边框浅色 | `--el-border-color-light` | `#e4e7ed` | 分隔线、浅边框 |
| 填充色 | `--el-fill-color` | `#f0f2f5` | hover 背景 |
| 填充浅色 | `--el-fill-color-light` | `#f5f7fa` | 浅 hover 背景 |
| 危险色 | `--el-color-danger` | `#F56C6C` | 关闭按钮 hover |
| 圆角基础 | `--el-border-radius-base` | `4px` | 按钮、输入框 |
| 圆角圆形 | `--el-border-radius-round` | `20px` | 药丸形按钮 |
| 阴影 | `--el-box-shadow` | `0 2px 4px rgba(0,0,0,.12), 0 0 6px rgba(0,0,0,.04)` | 标准投影 |
| 阴影浅 | `--el-box-shadow-light` | `0 2px 12px 0 rgba(0,0,0,.1)` | 浅投影 |

### 对比度验证（WCAG AA）

| 组合 | 对比度 | 结果 |
|------|--------|------|
| 主文字 `#303133` on `#ffffff` | ~13:1 | ✅ |
| 常规文字 `#606266` on `#ffffff` | ~5.7:1 | ✅ |
| 次要文字 `#909399` on `#ffffff` | ~3.5:1 | ✅（大文字） |
| 主色 `#409EFF` on `#ffffff` | ~3.6:1 | ✅（大文字） |

---

## 字体规范（参考 Element Plus）

| 元素 | 字号 | 字重 | 字体 | 行高 |
|------|------|------|------|------|
| 面包屑 | 12px (`--el-font-size-extra-small`) | 500 (`--el-font-weight-primary`) | 系统字体 | 1 |
| 工具按钮标签 | 14px (`--el-font-size-base`) | 500 | 系统字体 | 1 |
| 激活按钮标签 | 14px | 500 | 系统字体 | 1 |
| 颜色模式按钮 | 12px | 500 | `SF Mono, Consolas, monospace` | 1 |
| 颜色输入框 | 14px | 400 | `SF Mono, Consolas, monospace` | 1 |

### Element Plus 字号参考

| 级别 | 变量 | 值 |
|------|------|-----|
| 特大 | `--el-font-size-extra-large` | 20px |
| 大 | `--el-font-size-large` | 18px |
| 中 | `--el-font-size-medium` | 16px |
| 基础 | `--el-font-size-base` | 14px |
| 小 | `--el-font-size-small` | 13px |
| 特小 | `--el-font-size-extra-small` | 12px |

### Element Plus 字重

| 变量 | 值 |
|------|-----|
| `--el-font-weight-primary` | 500 |
| `--el-font-weight-bold` | 600 |

---

## 尺寸规范（参考 Element Plus 间距体系）

Element Plus 间距：2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48px

### 面板

- 高度：自动（内容撑开）
- 内边距：`8px 12px`（`--el-component-size` 基于 40px，此处为紧凑模式）
- 圆角：`8px`（`--el-border-radius-base` 的 2 倍，略大以区分按钮）
- 最大宽度：`calc(100vw - 48px)`
- 边框：`1px solid var(--el-border-color-light)` → `#e4e7ed`

### 面包屑

- 内边距：`4px 10px`
- 圆角：`4px`（`--el-border-radius-base`）
- 背景：`var(--el-fill-color-light)` → `#f5f7fa`

### 工具按钮

- 内边距：`8px 14px`
- 圆角：`6px`（介于 base 和 round 之间）
- 图标容器：`30px × 30px`，圆角 `6px`
- 图标尺寸：`16px`（SVG）
- 间距：按钮间 `4px`

### 颜色选择器

- 色盘：`24px × 24px`，圆角 `4px`
- 模式按钮：`24px` 高，`8px` 内边距，圆角 `4px`
- 输入框：`24px` 高，`80px` 宽，圆角 `4px`

### 关闭按钮

- 尺寸：`24px × 24px`
- 圆角：`4px`

---

## 交互状态

### 工具按钮

| 状态 | 背景 | 文字 | 边框 | 其他 |
|------|------|------|------|------|
| 默认 | 透明 | `#606266`（regular） | 无 | — |
| hover | `#f5f7fa`（fill-light） | `#606266` | 无 | — |
| active | `#f0f2f5`（fill） | `#909399`（secondary） | 无 | `scale(0.97)` |
| activated | `#ecf5ff`（primary-light-9） | `#409EFF`（primary） | `inset 0 0 0 1px rgba(64,158,255,0.2)` | — |
| activated+hover | `#d9ecff`（primary-light-8） | `#409EFF` | `inset 0 0 0 1px rgba(64,158,255,0.3)` | — |

### 图标容器

| 状态 | 背景 | 图标色 |
|------|------|--------|
| 默认 | `#ecf5ff`（primary-light-9） | `#409EFF` |
| hover | `#d9ecff`（primary-light-8） | `#409EFF`，`scale(1.05)` |
| activated | `#d9ecff`（primary-light-8） | `#409EFF` |

### 关闭按钮

| 状态 | 背景 | 图标色 |
|------|------|--------|
| 默认 | `#f5f7fa`（fill-light） | `#909399`（secondary） |
| hover | `#F56C6C`（danger） | `#fff`，`rotate(90deg)` |

### 面包屑项

| 状态 | 背景 | 文字色 |
|------|------|--------|
| 默认 | 透明 | `#909399`（secondary） |
| hover | `#f5f7fa`（fill-light） | `#606266`（regular） |
| active（当前层级） | `#f0f2f5`（fill） | `#303133`（primary），`font-weight: 500` |

### 颜色输入框

| 状态 | 边框 | 背景 |
|------|------|------|
| 默认 | `#dcdfe6`（border） | `#f5f7fa`（fill-light） |
| hover | `#c0c4cc`（border-hover） | `#f5f7fa` |
| focus | `#409EFF`（primary） | `#fff`，`box-shadow: 0 0 0 2px rgba(64,158,255,0.2)` |

---

## 过渡动画（参考 Element Plus）

| 属性 | 时长 | 缓动函数 |
|------|------|----------|
| 背景色变化 | 200ms | `--el-transition-duration` |
| 文字色变化 | 200ms | `--el-transition-duration` |
| scale 变换 | 250ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| 面包屑切换 | 300ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| 入场动画 | 350ms | `cubic-bezier(0.34, 1.56, 0.64, 1)`，`translateY(8px) → 0` |

---

## 响应式行为

| 视口宽度 | 行为 |
|----------|------|
| > 768px | 正常显示所有元素 |
| 480-768px | 工具按钮区域可水平滚动 |
| < 480px | 面包屑截断，工具按钮区域滚动 |

---

## 视觉示意（ASCII）

```
默认状态（根菜单）：
┌─────────────────────────────────────────────────────────┐
│  [移动]  [视角>]  [测量>]  [标注>]  [剖切>]  [材质>]  [导出>]  │
└─────────────────────────────────────────────────────────┘
  字号 14px  颜色 #606266  hover 背景 #f5f7fa

子菜单状态（材质 > 线框激活）：
┌──────────────────────────────────────────────────────────────┐
│  材质 >  │  [线框] [X光] [法线] [纯色]  │ ● HEX #ffffff │ × │
└──────────────────────────────────────────────────────────────┘
           ↑ #409EFF     ↑ 内边框         ↑ fill-light 背景
           ↑ #ecf5ff bg
```

---

## 与现有方案的主要差异

| 维度 | 现有方案 | 新方案（Element Plus 风格） |
|------|----------|---------------------------|
| 主色 | `#2979ff` | `#409EFF`（Element Plus 标准） |
| 主文字 | `#444` 硬编码 | `#303133`（`--el-text-color-primary`） |
| 常规文字 | `#444` | `#606266`（`--el-text-color-regular`） |
| 次文字 | `#999` | `#909399`（`--el-text-color-secondary`） |
| 字号 | 13px | 14px（`--el-font-size-base`） |
| 圆角 | 12px | 6px（更紧凑） |
| 激活方式 | 背景填充 + 外阴影 | 背景 + 内边框（更克制） |
| 面板背景 | `rgba(255,255,255,0.92)` | `#ffffff`（纯白） |
| 面板边框 | `rgba(255,255,255,0.6)` | `#e4e7ed`（`--el-border-color-light`） |
| 面板阴影 | 自定义三层 | `--el-box-shadow-light` |
| hover 背景 | `rgba(0,0,0,0.06)` | `#f5f7fa`（`--el-fill-color-light`） |
| 关闭按钮 | `rgba(0,0,0,0.05)` | `#f5f7fa`（`--el-fill-color-light`） |
| 字体 | 硬编码 | Element Plus CSS 变量 |
