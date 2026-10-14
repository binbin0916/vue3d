import type { ToolContext, ToolHandler, ToolDefinition } from './types';
import { defineTool } from './registry';

export const moveModel: ToolHandler = (ctx: ToolContext) => {
	ctx.controls.setMode('pan');
	void ctx;
};

export const revertMoveModel: ToolHandler = (ctx: ToolContext) => {
	ctx.controls.setMode('rotate');
	void ctx;
};

export const tools: ToolDefinition[] = [
	defineTool({
		id: 'move-model',
		menu: { icon: 'icon-move', label: '移动', activatable: true },
		activate: moveModel,
		deactivate: revertMoveModel,
	}),
];
