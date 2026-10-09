# vue-3d Project Agent Documentation

## Project Overview

**vue-3d** is a Vue 3 + Three.js based 3D model online viewer built on a **single-source tool definition + Vite auto-discovery** architecture. The application loads and renders `.glb` format 3D models with PBR material support, providing an interactive viewing experience with various tools and controls.

### Core Capabilities

- Load and display `.glb` 3D models with PBR material rendering
- TrackballControls for orbital interaction (rotate, zoom, pan)
- Material switching (wireframe, solid, X-ray, normal) with real-time color picker (HEX/RGB)
- Move mode toggle (orbital control / pan drag)
- Bottom toolbar with hierarchical menu, breadcrumb navigation, drag scrolling, gradient masks
- Radial menu (RadialMenu) for quick settings in the bottom-right corner
- Shared activation state between toolbar and radial menu via Pinia Store
- Single-source tool definitions: each tool declares its own menu metadata + lifecycle; menu layout only references tool ids
- Auto-discovery via `import.meta.glob`: drop a new file in `src/tools/` and it self-registers — no central registry to edit
- Menu tools (`tools`) and non-menu / param-passing actions (`actions`) live in two fully isolated registries

## Tech Stack

| Layer              | Technology                               |
| ------------------ | ---------------------------------------- |
| Frontend Framework | Vue 3 (Composition API `<script setup>`) |
| 3D Engine          | Three.js 0.184                           |
| Build Tool         | Vite 8 + TypeScript 6                    |
| State Management   | Pinia 3                                  |
| Styling            | SCSS (Element Plus design specs)         |
| Code Standards     | Oxlint + ESLint + Prettier               |

## Project Structure

```
vue-3d/
├── src/
│   ├── assets/
│   │   └── svgs/                    # SVG icon files (name = filename without extension)
│   ├── components/
│   │   ├── ColorPicker/             # Color picker with HEX/RGB mode switching
│   │   ├── DraggableDialog/         # Draggable dialog component
│   │   ├── FloatTooltip/            # Floating tooltip component
│   │   ├── Message/                 # Toast / message component
│   │   ├── ModelLoader/             # Loading overlay with progress bar
│   │   ├── ModelPropDialog/         # Model property dialog (reads ctx.sceneUserData)
│   │   ├── NextLoading/             # Next loading component
│   │   ├── RadialMenu/              # Radial settings menu (bottom-right)
│   │   ├── SectionDialog/           # Section cutting dialog
│   │   ├── SvgIcon/                 # SVG sprite icon component using vite-plugin-svg-icons
│   │   └── ToolBar/                 # Bottom toolbar with hierarchical menu + breadcrumb nav
│   ├── composables/
│   │   ├── useRayPicking.ts         # Ray picking composable
│   │   ├── useThreeScene.ts         # Core 3D scene state + lifecycle management
│   │   └── useViewCube.ts           # ViewCube composable
│   ├── router/
│   │   └── index.ts                 # Vue Router configuration
│   ├── stores/
│   │   └── tool.ts                  # Tool state management (Pinia Store)
│   ├── three/                       # Three.js modular setup
│   │   ├── camera.ts                # Perspective camera
│   │   ├── controls.ts              # TrackballControls
│   │   ├── css2DRenderer.ts         # CSS2D renderer
│   │   ├── index.ts                 # Barrel export
│   │   ├── light.ts                 # Multi-lighting system
│   │   ├── model.ts                 # GLB model loading + material replacement
│   │   ├── renderer.ts              # WebGL renderer
│   │   └── scene.ts                 # Scene creation
│   ├── tools/                       # Tool definitions + registries (single source + auto-discovery)
│   │   ├── types.ts                 # ToolContext / ToolDefinition / CustomAction / ToolMenuMeta / ToolItem
│   │   ├── registry.ts              # defineTool / defineAction / buildRegistry / buildActionRegistry / resolveMenu
│   │   ├── menu.config.ts           # Declarative menu layout (toolbarMenu / radialMenu)
│   │   ├── index.ts                 # import.meta.glob discovery + builds both registries + resolveToolAction
│   │   ├── annotate.ts              # Annotation tools (text, pin)
│   │   ├── axes.ts                  # Axes display toggle
│   │   ├── export.ts                # Export tools (screenshot, GLB, GLTF)
│   │   ├── material.ts              # Material tools (wireframe/X-ray/normal/solid + color picker)
│   │   ├── measure.ts               # Measurement tools (distance, angle, area)
│   │   ├── model.ts                 # Model property tools (entity/pointLineFace/overall)
│   │   ├── move.ts                  # Move speed control (custom action)
│   │   ├── section.ts               # Section cutting tools + custom actions
│   │   └── view.ts                  # View tools (front/back/left/right/top/bottom/origin/rotate)
│   ├── types/                       # Type definitions
│   ├── utils/
│   │   ├── common.ts                # Common utilities
│   │   ├── tree.ts                  # Generic tree search utility
│   │   ├── view.ts                  # View rotation configs
│   │   └── cube/                    # ViewCube related utilities
│   ├── views/
│   │   └── home.vue                 # Main home page
│   ├── App.vue                      # Root component
│   └── main.ts                      # Entry point
├── public/
│   └── model/get/                   # GLB model files
├── example/
│   └── myview.js                    # Legacy Three.js implementation reference
├── docs/                            # Documentation
├── dist/                            # Build output
└── [config files]
```

## Architecture

### Tool Action Flow (Single source + Auto-discovery)

```
Tool definition files (src/tools/*.ts)
  ├─ tools:   ToolDefinition[]   menu tools (with menu metadata)
  └─ actions: CustomAction[]     non-menu / param-passing actions
        │
        │  import.meta.glob auto-discovery (src/tools/index.ts)
        ▼
  buildRegistry  → toolRegistry        buildActionRegistry → actionRegistry
        │                                   │
        ▼                                   │
  menu.config.ts ──resolveMenu──▶ ToolItem tree (ToolBar / RadialMenu)
        │
        ▼
  User clicks menu item → toolStore toggles activation
        │
        ▼
  'tool-action' event → home.vue dispatches via resolveToolAction(id)
        │
        ▼
  handler runs (operates on the Three.js scene via ToolContext)
```

### Core Types

```typescript
// src/tools/types.ts
export interface ToolContext {
	renderer: THREE.WebGLRenderer;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	modelGroup: THREE.Object3D; // model root group (rotated 45°)
	controls: TrackballControls;
	modelSize: number; // bounding-box max edge length
	moveSpeed: number; // move speed multiplier
	meshes: THREE.Mesh[]; // flat array of all Mesh objects
	box: THREE.Box3; // model bounding box
	sceneUserData: GLBSceneUserData; // model-level custom properties
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

export type ToolHandler = (ctx: ToolContext, payload?: any) => void;

export type FrameTask = (context: {
	delta: number;
	elapsed: number;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	modelGroup: THREE.Object3D;
}) => void;

// Menu-tool definition (single source of truth)
export interface ToolDefinition {
	id: string; // tool action id
	menu: ToolMenuMeta; // menu metadata (required)
	defaultColor?: string; // default color (for color pickers and other UI)
	activate: ToolHandler; // activation handler
	deactivate?: ToolHandler; // restore handler; auto-registers `${id}:restore`
}

// Non-menu, param-passing action (isolated from menu tools)
export interface CustomAction {
	id: string; // action id
	handler: ToolHandler; // may receive a payload
}

// Menu display metadata — global unique source for a given id
export interface ToolMenuMeta {
	icon: string; // SVG icon name (src/assets/svgs/)
	label: string; // menu display text
	activatable?: boolean; // keep highlighted when active
	group?: string; // same group coexists; different groups are exclusive
}

// Resolved menu item (rendered by ToolBar / RadialMenu)
export interface ToolItem extends ToolMenuMeta {
	id: string; // action id dispatched via resolveToolAction
	children?: ToolItem[]; // submenu items
}
```

### Tool Registry (auto-built, two isolated registries)

`src/tools/index.ts` discovers every `*.ts` under `src/tools/` (excluding `index.ts`, `types.ts`, `registry.ts`, `menu.config.ts`) via `import.meta.glob`, then builds two registries:

```typescript
// src/tools/index.ts
const modules = import.meta.glob<{ tools?: ToolDefinition[]; actions?: CustomAction[] }>(
	['./*.ts', '!./index.ts', '!./types.ts', '!./registry.ts', '!./menu.config.ts'],
	{ eager: true }
);

export const toolDefinitions: ToolDefinition[] = Object.values(modules).flatMap((m) => m.tools ?? []);
export const customActions: CustomAction[] = Object.values(modules).flatMap((m) => m.actions ?? []);
export const definitionsById = new Map(toolDefinitions.map((def) => [def.id, def]));

export const toolRegistry = buildRegistry(toolDefinitions); // menu tools + `${id}:restore`
export const actionRegistry = buildActionRegistry(customActions); // non-menu actions

export function resolveToolAction(action: string): ToolHandler | undefined {
	return toolRegistry[action] ?? actionRegistry[action]; // menu first, then actions
}
```

- **`toolRegistry`** — menu tools: `activate` registered at `${id}`, `deactivate` auto-derived at `${id}:restore`
- **`actionRegistry`** — non-menu / param actions (e.g. `section-plane:invert`, `move:setSpeed`, `material-solid:color`)
- Menu tools carry **no payload**; all parameter passing lives in `actions`

### Menu Layout & ToolItem

Menu layout (`src/tools/menu.config.ts`) is declarative and references tool **ids** only. Icon/label and other metadata always come from the tool definition — never overridden per-menu — so the same id stays globally consistent across ToolBar and RadialMenu.

```typescript
// src/tools/registry.ts
export type MenuNode = string | MenuLeaf | MenuGroup;
export interface MenuGroup {
	id: string;
	icon: string;
	label: string;
	children: MenuNode[];
}
export interface MenuLeaf {
	id: string;
	icon?: string; // required only for placeholder leaves
	label?: string; // required only for placeholder leaves
	activatable?: boolean;
}

// src/tools/types.ts
export interface ToolItem extends ToolMenuMeta {
	id: string; // action id dispatched via resolveToolAction
	children?: ToolItem[]; // submenu items
}
```

`resolveMenu(nodes, definitionsById)` merges layout + definitions into a `ToolItem[]` tree. Placeholder leaves (no backing tool yet) may inline `{ id, icon, label, activatable }`; a leaf that matches neither a definition nor an inline icon/label is skipped with a dev warning.

### Active Tools Management

- `activeTools` is a `ref<Set<string>>` tracking all active tool IDs
- **Toggle**: clicking an already-active tool sends `{action}:restore` and removes it from the set
- **Group exclusivity**: activating a tool restores other tools in the same `group`
- **Menu close**: `handleClose` restores all active tools in the closing submenu
- **Breadcrumb navigation**: `handleBreadcrumbClick` restores tools in skipped levels

### Restore Actions (auto-derived)

Any menu tool that modifies the scene declares a `deactivate` handler; `buildRegistry` automatically registers it at `${id}:restore`. No manual registry entry is needed:

```typescript
defineTool({
	id: 'material-wireframe',
	menu: { icon: 'material', label: '线框显示', activatable: true, group: 'material' },
	activate: materialWireframe,
	deactivate: restoreMaterial, // ⇒ auto-registers 'material-wireframe:restore'
});
```

## Key Composables

### useThreeScene

The core composable that manages the 3D scene lifecycle:

```typescript
// src/composables/useThreeScene.ts
export function useThreeScene() {
	// Returns:
	return {
		init, // Initialize 3D scene
		dispose, // Destroy 3D scene, release resources
		loading, // Loading state
		loadProgress, // Loading progress
		renderer, // WebGL renderer
		scene, // Three.js scene
		camera, // Perspective camera
		modelGroup, // Model root group (rotated 45°)
		controls, // TrackballControls
		modelSize, // Model bounding box max edge length
		isMoveMode, // Move mode state
		moveSpeed, // Move speed multiplier
		autoRotate, // Auto-rotate state
		meshes, // Flat array of all Mesh objects
		box, // Model bounding box
		sceneUserData, // Model-level custom properties (GLBSceneUserData)
		setMoveMode, // Toggle move mode
		setMoveSpeed, // Set move speed
		rotateToView, // Rotate camera to specified view
		toggleAutoRotate, // Toggle auto-rotate
		setAutoRotate, // Set auto-rotate
		handleFaceClick, // Handle ViewCube face click
		setAxesVisibe, // Toggle axes display
		addFrameTask, // Register frame task
		removeFrameTask, // Remove frame task
	};
}
```

### useToolStore

Pinia store for shared tool state:

```typescript
// src/stores/tool.ts
export const useToolStore = defineStore('tool', () => {
	const activeTools = ref<Set<string>>(new Set());

	function toggle(id: string): boolean { ... }
	function activate(id: string) { ... }
	function deactivate(id: string) { ... }
	function isActive(id: string): boolean { ... }
	function clear() { ... }

	return {
		activeTools,
		toggle,
		activate,
		deactivate,
		isActive,
		clear,
	};
});
```

## Adding New Tools

### Step 1: Create a definition file

Create a file under `src/tools/` exporting `tools` (menu tools) and/or `actions` (non-menu / param actions). `import.meta.glob` auto-discovers it — **no central registry to edit**.

```typescript
// src/tools/your-tool.ts
import type { ToolContext, ToolHandler, ToolDefinition, CustomAction } from './types';
import { defineTool, defineAction } from './registry';

export const yourAction: ToolHandler = (ctx: ToolContext) => {
	// Operate on ctx.scene, ctx.modelGroup, etc.
};

// Toggleable tools provide a deactivate handler ⇒ auto-registers 'your-tool:restore'
export const restoreYourAction: ToolHandler = (ctx: ToolContext) => {
	// Restore original state
};

// ① Menu tools — rendered into ToolBar / RadialMenu
export const tools: ToolDefinition[] = [
	defineTool({
		id: 'your-tool',
		menu: { icon: 'your-icon', label: 'Your Tool', activatable: true, group: 'your-group' },
		activate: yourAction,
		deactivate: restoreYourAction,
	}),
];

// ② Custom actions — NOT in menus, called directly by business code, may take a payload
export const actions: CustomAction[] = [defineAction({ id: 'your-tool:invert', handler: yourInvertHandler })];
```

### Step 2: Reference the id in the menu layout

```typescript
// src/tools/menu.config.ts
export const toolbarMenu: MenuNode[] = [
	// ... existing entries
	'your-tool', // string form: reference the tool id directly
	{
		id: 'your-group',
		icon: 'your-icon',
		label: 'Your Group',
		children: ['your-tool'], // reference ids inside a group
	},
];
```

> To also show it in RadialMenu, reference the **same id** in `radialMenu` (order/grouping may differ). Icon/label always come from the definition, so both menus stay consistent.

> Placeholder leaves with no backing tool yet may inline `{ id, icon, label, activatable }` — they don't map to a tool id and do nothing on click.

## Code Conventions

- **Indentation**: Tabs (`.editorconfig` + `.prettierrc.json` enforced)
- **Prettier**: Tabs, single quotes, trailing commas, 150 char line width
- **Vue**: Only use `<script setup lang="ts">`
- **Styling**: SCSS `scoped`, BEM-style class names
- **Imports**: `@/` alias maps to `src/`
- **Three.js objects**: Use `shallowRef` (not `ref`) to avoid reactivity overhead
- **No console.log**: Use `console.warn`/`error`/`info`

## Commands

| Command           | Description                                 |
| ----------------- | ------------------------------------------- |
| `pnpm dev`        | Start dev server                            |
| `pnpm build`      | Type-check + production build               |
| `pnpm build-only` | Build only (skip type-check)                |
| `pnpm preview`    | Preview production build                    |
| `pnpm lint`       | Run oxlint → eslint → prettier sequentially |
| `pnpm type-check` | Type-check only (`vue-tsc --build`)         |

## Model Files

Place `.glb` files in `public/model/get/`. The page reads the model code from `<script id="code" data-code="...">`, and the loader requests `/model/get/<code>.glb` (`MODEL_PATH` in `src/composables/useThreeScene.ts`).

## Key Patterns

1. **shallowRef for Three.js objects**: Avoids Vue reactivity overhead on complex 3D objects
2. **Module-level Map for material restore**: Material tools store original materials in `Map<uuid, Material>` for restore
3. **Frame tasks**: Dynamic per-frame animation registration via `addFrameTask`
4. **ViewCube**: Independent renderer + DOM container for the view cube widget
5. **CSS clamp() responsive design**: Fluid scaling for 360px ~ 2560px devices
6. **Auto-discovery**: `import.meta.glob` in `src/tools/index.ts` registers every definition file — add a file, get a tool
7. **Two isolated registries**: menu tools (`toolRegistry`) vs non-menu / param actions (`actionRegistry`); `resolveToolAction` checks menu first

## Performance Considerations

- Renderer has `localClippingEnabled = true` for clipping plane support
- Minimum loading display time of 1 second for UX
- Frame tasks auto-remove on error to prevent repeated console errors
- `shallowRef` prevents deep reactivity on Three.js objects

## Debugging Tips

- Check `eslint.config.ts` before adding new ESLint rules (many are deliberately off)
- Tool handler errors are caught and logged to console
- Frame task errors auto-remove the task to prevent spam
- Use `console.warn`/`error`/`info` instead of `console.log`

## Browser Support

- WebGL 2 required for Three.js
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design from 360px to 2560px viewport width
