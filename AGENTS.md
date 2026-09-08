# vue-3d Project Agent Documentation

## Project Overview

**vue-3d** is a Vue 3 + Three.js based 3D model online viewer with an extensible toolbar architecture using the strategy pattern. The application loads and renders `.glb` format 3D models with PBR material support, providing an interactive viewing experience with various tools and controls.

### Core Capabilities

- Load and display `.glb` 3D models with PBR material rendering
- TrackballControls for orbital interaction (rotate, zoom, pan)
- Material switching (wireframe, solid, X-ray, normal) with real-time color picker (HEX/RGB)
- Move mode toggle (orbital control / pan drag)
- Bottom toolbar with hierarchical menu, breadcrumb navigation, drag scrolling, gradient masks
- Radial menu (RadialMenu) for quick settings in the bottom-right corner
- Shared activation state between toolbar and radial menu via Pinia Store
- Strategy pattern toolbar: create handler file + register to extend new tools

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
│   │   ├── ModelLoader/             # Loading overlay with progress bar
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
│   ├── tools/                       # Tool handlers (Strategy Pattern)
│   │   ├── annotate.ts              # Annotation tools (text, pin)
│   │   ├── axes.ts                  # Axes display toggle
│   │   ├── export.ts                # Export tools (screenshot, GLB, GLTF)
│   │   ├── index.ts                 # action → handler registry
│   │   ├── material.ts              # Material tools (wireframe/X-ray/normal/solid + color picker)
│   │   ├── measure.ts               # Measurement tools (distance, angle, area)
│   │   ├── move.ts                  # Move speed control
│   │   ├── section.ts               # Section cutting tools
│   │   ├── types.ts                 # ToolContext interface + ToolHandler type
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

### Tool Action Flow (Strategy Pattern)

```
User clicks menu item (ToolBar or RadialMenu)
    ↓
Menu component toggles activation via toolStore
    ↓
ToolBar emits 'tool-action' event
    ↓
home.vue dispatches via toolRegistry
    ↓
handler function executes (operates Three.js scene)
```

### Core Types

```typescript
// src/tools/types.ts
export interface ToolContext {
	renderer: THREE.WebGLRenderer;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	modelGroup: THREE.Object3D;
	controls: TrackballControls;
	modelSize: number;
	moveSpeed: number;
	meshes: THREE.Mesh[];
	box: THREE.Box3;
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
```

### Tool Registry

```typescript
// src/tools/index.ts
export const toolRegistry: Record<string, ToolHandler> = {
	// Return to origin
	'return-origin': viewOrigin,
	// Movement
	'move:setSpeed': setMoveSpeed,
	// Rotation
	rotate: viewRotate,
	'rotate:restore': resetViewRotate,
	// Axes
	axes: showAxes,
	'axes:restore': hideAxes,
	// Views
	'view-front': viewFront,
	'view-back': viewBack,
	'view-left': viewLeft,
	'view-right': viewRight,
	'view-top': viewTop,
	'view-bottom': viewBottom,
	// Measurement
	'measure-distance': measureDistance,
	'measure-angle': measureAngle,
	'measure-area': measureArea,
	// Annotation
	'annotate-text': annotateText,
	'annotate-pin': annotatePin,
	// Section cutting
	'section-plane': sectionPlane,
	'section-plane:restore': sectionReset,
	'section-sphere': sectionSphere,
	'section-sphere:restore': sectionReset,
	'section-plane:invert': sectionInvert,
	'section-plane:visible': sectionVisible,
	'section-plane:reset': sectionResetPosition,
	// Material
	'material-wireframe': materialWireframe,
	'material-wireframe:restore': restoreMaterial,
	'material-xray': materialXray,
	'material-xray:restore': restoreMaterial,
	'material-normal': materialNormal,
	'material-normal:restore': restoreMaterial,
	'material-solid': materialSolid,
	'material-solid:restore': restoreMaterial,
	'material:restore': restoreMaterial,
	// Export
	'export-screenshot': exportScreenshot,
	'export-glb': exportGlb,
	'export-gltf': exportGltf,
};
```

### ToolItem Interface

```typescript
interface ToolItem {
	id: string; // Action identifier sent to toolRegistry
	icon: string; // SVG icon name from src/assets/svgs/
	label: string; // Display text
	activatable?: boolean; // Toggle highlight on click
	children?: ToolItem[]; // Submenu items
	color?: boolean; // Show color picker (wireframe/solid)
	defaultColor?: string; // Initial color when activated
	group?: string; // Tools with same group coexist; different groups are exclusive
}
```

### Active Tools Management

- `activeTools` is a `ref<Set<string>>` tracking all active tool IDs
- **Toggle**: clicking an already-active tool sends `{action}:restore` and removes from set
- **Group exclusivity**: activating a tool restores other tools in the same `group`
- **Menu close**: `handleClose` restores all active tools in the closing submenu
- **Breadcrumb navigation**: `handleBreadcrumbClick` restores tools in skipped levels

### Restore Actions

Every tool that modifies the scene must have a `:restore` counterpart in the registry:

```typescript
'material-wireframe': materialWireframe,
'material-wireframe:restore': restoreMaterial,
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

### Step 1: Create Handler File

```typescript
// src/tools/your-tool.ts
import type { ToolContext, ToolHandler } from './types';

export const yourAction: ToolHandler = (ctx: ToolContext, payload?: string) => {
	// Operate on ctx.scene, ctx.modelGroup, etc.
};

// If toggleable, add restore handler
export const restoreYourAction: ToolHandler = (ctx: ToolContext) => {
	// Restore original state
};
```

### Step 2: Register to Registry

```typescript
// src/tools/index.ts
import { yourAction, restoreYourAction } from './your-tool';

export const toolRegistry: Record<string, ToolHandler> = {
	// ... existing tools
	'your-tool:action': yourAction,
	'your-tool:action:restore': restoreYourAction, // Required for toggleable tools
};
```

### Step 3: Add Menu Item

```typescript
// src/components/ToolBar/index.vue
const tools: ToolItem[] = [
	// ... existing menus
	{
		id: 'your-tool',
		icon: 'your-icon', // Corresponds to SVG file in src/assets/svgs/
		label: 'Your Tool',
		children: [{ id: 'your-tool:action', icon: 'your-icon', label: 'Action', activatable: true }],
	},
];
```

> **Note**: To display in RadialMenu, add a menu item with the **same ID** in RadialMenu's `menuItems`.

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

Place `.glb` files in `public/model/get/` directory. Default load path is `/model/get/<name>.glb`.

## Key Patterns

1. **shallowRef for Three.js objects**: Avoids Vue reactivity overhead on complex 3D objects
2. **Module-level Map for material restore**: Material tools store original materials in `Map<uuid, Material>` for restore
3. **Frame tasks**: Dynamic per-frame animation registration via `addFrameTask`
4. **ViewCube**: Independent renderer + DOM container for the view cube widget
5. **CSS clamp() responsive design**: Fluid scaling for 360px ~ 2560px devices

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
