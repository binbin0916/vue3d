# AGENTS.md

## Project Overview

Vue 3 + Three.js 3D model viewer. Loads `.glb` models, renders with `TrackballControls`, provides a bottom toolbar with tool actions (move, view, section, material, export) and a radial settings menu.

## Commands

- `pnpm dev` — start dev server
- `pnpm build` — type-check + build (`vue-tsc --build && vite build`)
- `pnpm lint` — runs oxlint → eslint → prettier sequentially
- `pnpm type-check` — `vue-tsc --build` only

## Code Conventions

- **Indentation**: tabs (not spaces), enforced by `.editorconfig` and `.prettierrc.json`
- **Prettier**: tabs, single quotes, trailing commas, 150 print width
- **TypeScript**: `noUncheckedIndexedAccess` enabled, `any` is allowed (eslint rules are relaxed)
- **Vue**: Composition API `<script setup lang="ts">` only, single-file components
- **Styling**: SCSS with `lang="scss" scoped`, BEM-ish class names
- **Imports**: `@/` alias maps to `src/`
- **ESLint**: oxlint runs first, then eslint, then prettier (in `lint` script). Many rules are deliberately off — check `eslint.config.ts` before adding new ones
- **No console.log**: `no-console` is error-level; use `console.warn`/`error`/`info`

## Architecture

### Tool Action Flow (Strategy Pattern)

```
ToolBar emits 'tool-action'
  → home.vue handleToolAction(action, payload)
    → toolRegistry[action](toolContext)
      → xxx.ts handler (operates Three.js scene)
```

- `src/tools/types.ts` — `ToolContext` interface (scene access), `ToolHandler` type
- `src/tools/index.ts` — registry mapping action strings to handler functions
- `src/tools/*.ts` — individual tool implementations (one file per feature)
- `home.vue` — builds `toolContext` from `useThreeScene()` refs, dispatches via registry

### ToolItem Properties

```ts
interface ToolItem {
	id: string;           // action identifier sent to toolRegistry
	icon: string;         // SVG icon name from src/assets/svgs/
	label: string;        // display text
	activatable?: boolean; // toggle highlight on click
	children?: ToolItem[]; // submenu items
	color?: boolean;       // show color picker (wireframe/solid)
	defaultColor?: string; // initial color when activated
	group?: string;        // tools with same group coexist; different groups are exclusive
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
```ts
'material-wireframe': materialWireframe,
'material-wireframe:restore': restoreMaterial,
```

### Core Files

- `src/composables/useThreeScene.ts` — owns all 3D state (renderer, scene, camera, modelGroup, controls) and lifecycle (init/dispose). Returns reactive refs consumed by `home.vue` to build `toolContext`
- `src/three/` — modular Three.js setup. Each file exports a single factory function. Barrel-exported from `src/three/index.ts`
- `src/components/ToolBar/` — bottom toolbar with hierarchical menu, breadcrumb nav, inline color picker. Emits `tool-action` events
- `src/components/RadialMenu/` — radial settings menu (bottom-right)
- `src/components/ModelLoader/` — loading overlay with progress bar
- `src/components/SvgIcon/` — SVG sprite icon component using `vite-plugin-svg-icons`
- `src/assets/svgs/` — SVG icon files (name = filename without extension)

## Key Patterns

- All Three.js objects use `shallowRef` (not `ref`) to avoid Vue reactivity overhead
- Renderer has `localClippingEnabled = true` — ready for clipping plane support
- Model is always at path `/model/get/<name>.glb`
- `useThreeScene` exposes raw refs (`renderer`, `scene`, `camera`, `modelGroup`, `controls`, `modelSize`) for `toolContext` construction
- Material tools store original materials in a module-level `Map<uuid, Material>` for restore
- ToolBar breadcrumb uses `justify-content: flex-end` — latest level always visible on the right
