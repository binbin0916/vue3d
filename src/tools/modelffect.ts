import type { ToolContext, ToolHandler, ToolDefinition } from './types';
import { defineTool } from './registry';
import { Material } from 'three';
import { showGroundShadow, restoreGroundShadow } from '@/tools/shadow';

export const setTransparent: ToolHandler = (ctx: ToolContext) => {
	ctx.meshes.forEach((mesh) => {
		(mesh.material as Material).transparent = true;
		(mesh.material as Material).opacity = 0.3;
	});
};

export const revertTransparent: ToolHandler = (ctx: ToolContext) => {
	ctx.meshes.forEach((mesh) => {
		(mesh.material as Material).transparent = true;
		(mesh.material as Material).opacity = 1;
	});
};

export const setOutline: ToolHandler = (ctx: ToolContext) => {
	ctx.lines.forEach((line) => {
		(line.material as Material).transparent = true;
		(line.material as Material).opacity = 0;
	});
};

export const revertOutline: ToolHandler = (ctx: ToolContext) => {
	ctx.lines.forEach((line) => {
		(line.material as Material).transparent = true;
		(line.material as Material).opacity = 1;
	});
};

export const setWireframe: ToolHandler = (ctx: ToolContext) => {
	ctx.meshes.forEach((mesh) => {
		(mesh.material as Material).transparent = true;
		(mesh.material as Material).opacity = 0;
	});
	ctx.lines.forEach((line) => {
		(line.material as Material).transparent = true;
		(line.material as Material).opacity = 1;
	});
};

export const revertWireframe: ToolHandler = (ctx: ToolContext) => {
	ctx.meshes.forEach((mesh) => {
		(mesh.material as Material).transparent = true;
		(mesh.material as Material).opacity = 1;
	});
};

export const tools: ToolDefinition[] = [
	defineTool({
		id: 'modelelffect-transparent',
		menu: { icon: 'icon-transparent', label: '透明', activatable: true },
		activate: setTransparent,
		deactivate: revertTransparent,
	}),
	defineTool({
		id: 'modelelffect-outline',
		menu: { icon: 'icon-noOutline', label: '轮廓线', activatable: true, group: 'modelelffect' },
		activate: setOutline,
		deactivate: revertOutline,
	}),
	defineTool({
		id: 'modelelffect-wireframe',
		menu: { icon: 'icon-onlyLine', label: '线框模式', activatable: true, group: 'modelelffect' },
		activate: setWireframe,
		deactivate: revertWireframe,
	}),
	defineTool({
		id: 'modelelffect-shadow',
		menu: { icon: 'icon-shadow', label: '阴影', activatable: true, group: 'modelelffect' },
		activate: showGroundShadow,
		deactivate: restoreGroundShadow,
	}),
];
