import type { ToolContext, ToolHandler, ToolDefinition } from './types';
import { defineTool } from './registry';
import { Group } from 'three';
import { createLine2FromVertices, getBoundingBoxPoints } from '@/utils/common';

let group: Group | null = null;

export const setBoundBox: ToolHandler = (ctx: ToolContext) => {
	group = new Group();

	// 轮廓线框
	const { vertices, edges } = getBoundingBoxPoints(ctx.box);
	const line2 = createLine2FromVertices(vertices, edges, {
		color: 0xffff00,
		lineWidth: 4,
		opacity: 1,
	});
	group.add(line2);

	ctx.modelGroup.add(group);
};

export const revertTransparent: ToolHandler = (ctx: ToolContext) => {
	if (!group) return;
	
	ctx.modelGroup.remove(group);
};

export const tools: ToolDefinition[] = [
	defineTool({
		id: 'boundbox',
		menu: { icon: 'icon-transparent', label: '包围盒', activatable: true },
		activate: setBoundBox,
		deactivate: revertTransparent,
	}),
];
