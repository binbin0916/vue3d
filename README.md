# vue-3d

基于 Vue 3 + Three.js 的 3D 模型在线查看器，采用策略模式的可扩展工具栏架构。

## 功能特性

- 加载并展示 `.glb` 格式 3D 模型，支持 PBR 材质渲染
- TrackballControls 轨道控制（旋转、缩放、平移）
- 材质切换（线框模式、纯色模式）+ 实时颜色选择器（HEX/RGB）
- 移动模式切换（轨道控制 / 平移拖拽）
- 底部工具栏：多级菜单 + 面包屑导航 + 拖拽滚动 + 渐变遮罩
- 径向菜单（RadialMenu）：右下角快捷设置菜单
- 工具栏与径向菜单共享激活状态（Pinia Store）
- 策略模式工具栏：创建 handler 文件 + 注册即可扩展新工具

## 技术栈

| 层级     | 技术                                      |
| -------- | ----------------------------------------- |
| 前端框架 | Vue 3（Composition API `<script setup>`） |
| 3D 引擎  | Three.js 0.184                            |
| 构建工具 | Vite 8 + TypeScript 6                     |
| 状态管理 | Pinia 3                                   |
| 样式     | SCSS（Element Plus 设计规范）             |
| 代码规范 | Oxlint + ESLint + Prettier                |

## 快速开始

```bash
# 环境要求
# Node.js ^22.18.0 或 >=24.12.0
# pnpm

# 安装
git clone <仓库地址>
cd vue-3d
pnpm install

# 启动开发服务器
pnpm dev
```

浏览器访问 `http://localhost:5173`

## 可用命令

| 命令              | 说明                                  |
| ----------------- | ------------------------------------- |
| `pnpm dev`        | 启动开发服务器                        |
| `pnpm build`      | 类型检查 + 生产构建                   |
| `pnpm build-only` | 仅构建（跳过类型检查）                |
| `pnpm preview`    | 预览生产构建                          |
| `pnpm lint`       | 按顺序执行 oxlint → eslint → prettier |
| `pnpm type-check` | 仅类型检查（`vue-tsc --build`）       |

## 项目架构

### 工具调用流程

```
用户点击菜单项（ToolBar 或 RadialMenu）
    ↓
菜单组件通过 toolStore 切换激活状态
    ↓
ToolBar 触发 'tool-action' 事件
    ↓
home.vue 通过 toolRegistry 分发
    ↓
handler 函数执行（操作 Three.js 场景）
```

### 目录结构

```
src/
├── composables/
│   └── useThreeScene.ts    # 3D 场景状态 + 生命周期管理
├── components/
│   ├── ToolBar/            # 底部工具栏（多级菜单 + 面包屑 + 拖拽滚动 + 颜色选择器）
│   ├── RadialMenu/         # 右下角径向设置菜单（与 ToolBar 共享激活状态）
│   ├── ModelLoader/        # 模型加载遮罩层（进度条）
│   └── SvgIcon/            # SVG 图标组件
├── stores/
│   └── tool.ts             # 工具状态管理（Pinia Store，ToolBar + RadialMenu 共享）
├── tools/                  # 工具处理器（策略模式）
│   ├── types.ts            # ToolContext 接口 + ToolHandler 类型
│   ├── index.ts            # action → handler 注册表
│   ├── material.ts         # 材质工具（线框/纯色 + 颜色选择器）
│   └── *.ts                # 每个功能一个文件
├── three/                  # Three.js 模块化封装
│   ├── renderer.ts         # WebGL 渲染器
│   ├── scene.ts            # 场景创建
│   ├── camera.ts           # 透视相机
│   ├── light.ts            # 多光源照明系统
│   ├── model.ts            # GLB 模型加载 + 材质替换
│   └── controls.ts         # TrackballControls 轨道控制器
└── utils/
    └── tree.ts             # 通用树形查找工具
```

### 菜单联动

ToolBar 和 RadialMenu 通过 Pinia Store（`src/stores/tool.ts`）共享激活状态：

- 两个菜单中相同功能的菜单项使用**相同的 ID**（如 `material-wireframe`）
- 任一菜单激活/取消工具，另一个菜单自动同步高亮
- 可切换工具必须提供 `:restore` 后缀的 handler 用于恢复原始状态

### 新增工具

**第 1 步：创建 handler 文件**

```ts
// src/tools/your-tool.ts
import type { ToolContext, ToolHandler } from './types';

export const yourAction: ToolHandler = (ctx: ToolContext, payload?: string) => {
	// 操作 ctx.scene、ctx.modelGroup 等
};
```

**第 2 步：注册到 registry**

```ts
// src/tools/index.ts
import { yourAction } from './your-tool';

export const toolRegistry: Record<string, ToolHandler> = {
	// ... 已有工具
	'your-tool:action': yourAction,
	'your-tool:action:restore': restoreHandler, // 可切换工具必须提供 restore
};
```

**第 3 步：添加菜单项**

```ts
// src/components/ToolBar/index.vue
const tools: ToolItem[] = [
	// ... 已有菜单
	{
		id: 'your-tool',
		icon: 'your-icon', // 对应 src/assets/svgs/ 下的 SVG 文件名
		label: '你的工具',
		children: [{ id: 'your-tool:action', icon: 'your-icon', label: '操作', activatable: true }],
	},
];
```

> [!NOTE]
> 若需在 RadialMenu 中也显示此工具，需在 RadialMenu 的 `menuItems` 中添加**相同 ID** 的菜单项。

### ToolItem 接口

```ts
interface ToolItem {
	id: string; // 发送给 toolRegistry 的 action 标识
	icon: string; // SVG 图标名
	label: string; // 显示文本
	activatable?: boolean; // 点击后是否高亮激活
	children?: ToolItem[]; // 子菜单
	color?: boolean; // 是否显示颜色选择器
	defaultColor?: string; // 激活时的默认颜色
	group?: string; // 同组工具可共存，不同组互斥
}
```

> [!NOTE]
> 同一 `group` 的工具效果可同时生效（如线框 + X光），不同 `group` 的工具互斥（如线框 vs 纯色）。

### ToolContext

所有工具处理器接收统一的上下文对象：

```ts
interface ToolContext {
	renderer: THREE.WebGLRenderer;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	modelGroup: THREE.Object3D;
	controls: TrackballControls;
	modelSize: number;
	isMoveMode: boolean;
	moveSpeed: number;
	setMoveMode: (enabled: boolean) => void;
	setMoveSpeed: (speed: number) => void;
}
```

## 工具栏特性

### 拖拽滚动

工具栏内容溢出时支持鼠标拖拽滚动：
- 按住拖拽：工具栏跟随鼠标移动
- 松开后：惯性滚动（逐渐减速）
- 拖拽距离 > 5px 时阻止点击事件，避免误触菜单

### 响应式设计

- 使用 CSS `clamp()` 实现流式缩放，适配 360px ~ 2560px 设备
- 容器宽度 < 480px 时隐藏面包屑和文字标签（仅图标）
- 容器宽度 ≥ 768px 时显示面包屑

### 颜色选择器

材质工具（线框/纯色）激活时显示颜色选择器：
- 色盘选择 + HEX/RGB 模式切换
- 文本输入框支持手动输入颜色值
- 实时预览：选色后立即应用到模型

## 代码规范

- **缩进**：Tab（`.editorconfig` + `.prettierrc.json` 强制）
- **Prettier**：Tab、单引号、尾逗号、150 字符行宽
- **Vue**：仅使用 `<script setup lang="ts">`
- **样式**：SCSS `scoped`，BEM 风格类名
- **导入**：`@/` 别名映射到 `src/`
- **Three.js 对象**：使用 `shallowRef`（非 `ref`）避免响应式开销
- **禁止 console.log**：使用 `console.warn`/`error`/`info`

## 模型文件

将 `.glb` 文件放置在 `public/model/get/` 目录下，默认加载路径为 `/model/get/export_convert_323248_151.glb`。
