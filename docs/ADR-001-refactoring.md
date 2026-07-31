# ADR-001: vue-3d 代码重构

## 状态
已批准

## 背景
vue-3d 项目经过多轮功能迭代，积累了以下技术债务：
- 菜单导航逻辑在 ToolBar 和 RadialMenu 中重复 3 次
- 17/26 注册的工具是空函数
- RadialMenu 事件未接入 home.vue
- useThreeScene 的 RAF 循环未取消
- 材质存储跨模型失效
- ToolContext API 混用 ref 和值

## 决策
按优先级分 5 批重构：

### 第 1 批：修复 P0/P1 Bug（紧急）
1. useThreeScene RAF 循环取消 + init 错误处理
2. material.ts 材质存储改为 per-context
3. ToolContext 统一为全部 unwrapped 值

### 第 2 批：提取公共模块
1. 提取 `src/utils/tree.ts`（findItemById）
2. 提取 `src/utils/menu.ts`（菜单导航状态机）
3. 统一 ToolItem/MenuItem 为一个类型

### 第 3 批：修复 RadialMenu
1. RadialMenu 接入 toolRegistry
2. 统一激活模型（Set + group）

### 第 4 批：清理死代码
1. 删除未使用的 containerRef
2. 删除死 CSS（.breadcrumb-root）
3. 删除注释掉的 media query
4. 删除死 registry entry（material:restore）

### 第 5 批：代码质量提升
1. 提取 SCSS 主题变量
2. 提取 forEachMesh 工具函数
3. 暴露 meshes 到 ToolContext
4. 统一 action id 命名规范

## 理由
1. 先修 bug 再重构，降低风险
2. 小步迭代，每次只改一个模块
3. 每步完成后跑 type-check + lint 验证

## 时间表
- 第 1 批：1 小时
- 第 2 批：1 小时
- 第 3 批：30 分钟
- 第 4 批：30 分钟
- 第 5 批：1 小时
