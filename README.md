# vue-3d

基于 Vue 3 + Three.js 的 3D 模型在线查看器，采用「单一数据源工具定义 + Vite 自动发现」的可扩展工具栏架构。

## 功能特性

- 加载并展示 `.glb` 格式 3D 模型，支持 PBR 材质渲染
- TrackballControls 轨道控制（旋转、缩放、平移）
- 材质切换（线框 / X光 / 法线 / 纯色）+ 实时颜色选择器（HEX/RGB）
- 移动模式切换（轨道控制 / 平移拖拽）
- 底部工具栏：多级菜单 + 面包屑导航 + 拖拽滚动 + 渐变遮罩
- 径向菜单（RadialMenu）：右下角快捷设置菜单
- 工具栏与径向菜单共享激活状态（Pinia Store）
- 单一数据源工具定义 + Vite `import.meta.glob` 自动发现：新增文件即自动注册，无需手改注册表
- 声明式菜单布局：菜单只引用工具 id，图标/文案由定义统一提供，保证同 id 在 ToolBar 与 RadialMenu 全局一致

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
工具定义（src/tools/*.ts）
  ├─ `tools: ToolDefinition[]`   菜单工具（含 menu 元数据）
  └─ `actions: CustomAction[]`   非菜单的自定义/传参动作
    ↓  import.meta.glob 自动发现
buildRegistry / buildActionRegistry 建立两套独立注册表
    ↓
menu.config.ts 声明布局 ──resolveMenu──▶ ToolItem 菜单树（ToolBar / RadialMenu）
    ↓
用户点击菜单项（或业务直接调用动作）→ toolStore 切换激活状态
    ↓
触发 'tool-action' 事件 → home.vue 用 resolveToolAction 分发
    ↓
handler 函数执行（操作 Three.js 场景）
```

### 目录结构

```
src/
├── composables/
│   └── useThreeScene.ts    # 3D 场景状态 + 生命周期管理
├── components/
│   ├── ToolBar/            # 底部工具栏（多级菜单 + 面包屑 + 拖拽滚动）
│   ├── RadialMenu/         # 右下角径向设置菜单（与 ToolBar 共享激活状态）
│   ├── ModelLoader/        # 模型加载遮罩层（进度条）
│   └── SvgIcon/            # SVG 图标组件
├── stores/
│   └── tool.ts             # 工具状态管理（Pinia Store，ToolBar + RadialMenu 共享）
├── tools/                  # 工具定义 + 注册（单一数据源 + 自动发现）
│   ├── types.ts            # ToolContext / ToolDefinition / CustomAction / ToolItem 等类型
│   ├── registry.ts         # defineTool / defineAction / buildRegistry / buildActionRegistry / resolveMenu
│   ├── menu.config.ts      # 声明式菜单布局（toolbarMenu / radialMenu）
│   ├── index.ts            # import.meta.glob 自动发现 + 构建两套注册表 + resolveToolAction
│   ├── material.ts         # 材质工具（线框/X光/法线/纯色 + 颜色选择器）
│   └── *.ts                # 每个功能一个文件，导出 tools 和/或 actions
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

- 菜单布局（`menu.config.ts`）只引用工具 **id**，图标/文案等元数据由 `ToolDefinition.menu` 统一提供，**禁止跨菜单覆盖**，保证同 id 全局一致
- 任一菜单激活/取消工具，另一个菜单自动同步高亮
- 可切换工具在定义中声明 `deactivate`，注册表自动派生 `${id}:restore` 用于恢复原始状态
- 菜单只承载 `tools`；`section-plane:invert`、`move:setSpeed` 等非菜单自定义/传参动作归入 `actions`，不进入菜单树

### 新增工具

**第 1 步：创建工具定义文件**

在 `src/tools/` 下新增文件，导出 `tools: ToolDefinition[]`。`import.meta.glob` 会自动发现并注册，**无需手动修改注册表**。

```ts
// src/tools/your-tool.ts
import type { ToolContext, ToolHandler, ToolDefinition, CustomAction } from './types';
import { defineTool, defineAction } from './registry';

export const yourAction: ToolHandler = (ctx: ToolContext, payload?: string) => {
	// 操作 ctx.scene、ctx.modelGroup 等
};

// 可切换工具提供 deactivate，注册表自动派生 'your-tool:restore'
export const restoreYourAction: ToolHandler = (ctx: ToolContext) => {
	// 恢复原始状态
};

// ① 菜单工具：会渲染进 ToolBar / RadialMenu
export const tools: ToolDefinition[] = [
	defineTool({
		id: 'your-tool',
		menu: { icon: 'your-icon', label: '你的工具', activatable: true, group: 'your-group' },
		activate: yourAction,
		deactivate: restoreYourAction,
	}),
];

// ② 自定义动作：不进菜单，由业务代码直接调用（可传参），独立注册
export const actions: CustomAction[] = [defineAction({ id: 'your-tool:invert', handler: yourInvertHandler })];
```

**第 2 步：在菜单布局中引用 id**

```ts
// src/tools/menu.config.ts
export const toolbarMenu: MenuNode[] = [
	// ... 已有菜单
	'your-tool', // 字符串形式直接引用工具 id
	{
		id: 'your-group',
		icon: 'your-icon',
		label: '你的分组',
		children: ['your-tool'], // 分组内引用 id
	},
];
```

> [!NOTE]
> 若需在 RadialMenu 中也显示，同样在 `radialMenu` 中引用**相同 id** 即可（顺序与分组可不同）。菜单项的图标/文案始终取自工具定义，两个菜单天然一致。

> [!TIP]
> 若菜单项暂无对应工具（供后续开发预留），可内联 `{ id, icon, label, activatable }` 作为**占位叶子**——它与工具 id 无关，点击不触发逻辑。

### 工具定义类型

菜单工具与自定义动作是**两套相互隔离的对象**，各自注册：

```ts
// 菜单工具定义（单一数据源）——会渲染进菜单
interface ToolDefinition {
	id: string; // 工具动作 id
	menu: ToolMenuMeta; // 菜单展示元数据（必填）
	defaultColor?: string; // 工具默认颜色（供颜色选择器等 UI 初始化；可选）
	activate: ToolHandler; // 激活/执行处理器
	deactivate?: ToolHandler; // 关闭/恢复处理器；存在时自动派生 `${id}:restore`
}

// 自定义动作——不进菜单，由业务直接调用，可传参
interface CustomAction {
	id: string; // 动作 id（如 'section-plane:invert'、'move:setSpeed'）
	handler: ToolHandler; // 动作处理器
}

// 菜单展示元数据（同 id 的全局唯一来源，禁止跨菜单覆盖）
interface ToolMenuMeta {
	icon: string; // SVG 图标名（src/assets/svgs/ 下文件名）
	label: string; // 菜单显示文本
	activatable?: boolean; // 点击后是否保持高亮
	group?: string; // 同组可共存，不同组互斥
}

// 解析后的菜单项（供 ToolBar / RadialMenu 渲染）
interface ToolItem extends ToolMenuMeta {
	id: string;
	children?: ToolItem[];
}
```

> [!NOTE]
> 同一 `group` 的工具效果可同时生效（如线框 + X光），不同 `group` 的工具互斥（如线框 vs 纯色）。

> [!IMPORTANT]
> 菜单工具（`tools`）与自定义/传参动作（`actions`）彻底分离：前者经 `buildRegistry` 生成 `toolRegistry` 并参与菜单渲染；后者经 `buildActionRegistry` 生成 `actionRegistry`。`home.vue` 统一通过 `resolveToolAction(id)` 分发（先查 `toolRegistry`，再查 `actionRegistry`）。

### ToolContext

所有工具处理器接收统一的上下文对象（`home.vue` 通过 `reactive(useThreeScene())` 自动注入，字段均为已解包的值）：

```ts
interface ToolContext {
	renderer: THREE.WebGLRenderer;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	modelGroup: THREE.Object3D; // 模型根组（已旋转 45°）
	controls: TrackballControls;
	modelSize: number; // 模型包围盒最大边长
	moveSpeed: number; // 移动速度倍率
	meshes: THREE.Mesh[]; // 模型中所有 Mesh 的扁平数组
	box: THREE.Box3; // model 包围盒
	sceneUserData: GLBSceneUserData; // 模型总属性
	setMoveMode: (enabled: boolean) => void;
	setMoveSpeed: (speed: number) => void;
	rotateToView: (targetPosition: THREE.Vector3, targetUp: THREE.Vector3, duration?: number) => void;
	autoRotate: boolean;
	toggleAutoRotate: () => void;
	setAutoRotate: (enabled: boolean) => void;
	handleFaceClick: (meshname: string) => void;
	setAxesVisibe: (enabled: boolean) => void;
	addFrameTask: (id: string, task: FrameTask) => void;
	removeFrameTask: (id: string) => void;
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

纯色工具（`material-solid`）激活时显示颜色选择器：

- 色盘选择 + HEX/RGB 模式切换
- 文本输入框支持手动输入颜色值
- 实时预览：选色后通过 `material-solid:color` 自定义动作立即应用到模型
- 初始颜色取自工具定义声明的 `defaultColor`，与实际应用色一致

## 代码规范

- **缩进**：Tab（`.editorconfig` + `.prettierrc.json` 强制）
- **Prettier**：Tab、单引号、尾逗号、150 字符行宽
- **Vue**：仅使用 `<script setup lang="ts">`
- **样式**：SCSS `scoped`，BEM 风格类名
- **导入**：`@/` 别名映射到 `src/`
- **Three.js 对象**：使用 `shallowRef`（非 `ref`）避免响应式开销
- **禁止 console.log**：使用 `console.warn`/`error`/`info`

## 模型文件

将 `.glb` 文件放置在 `public/model/get/` 目录下。页面通过 `<script id="code" data-code="...">` 读取模型编码，加载路径为 `/model/get/<code>.glb`。
