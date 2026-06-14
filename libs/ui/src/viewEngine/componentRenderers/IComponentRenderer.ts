import type { RenderResult } from '../core';
import type { AdapterContext } from '../metadata/registry';
import type { ComponentNode } from '../metadata/types';


/** Runtime context handed to a component renderer. */
export type ComponentRenderContext = {
	ctx: AdapterContext,
};

/**
 * Engine-agnostic renderer for a `"type": "component"` metadata node. Renderers
 * are registered by their `type` (the node's `component` value) and turn a node
 * into a RenderResult. The metadata JSON and this registry stay stable across
 * rendering engines.
 */
export interface IComponentRenderer {
	readonly type: string,
	render(node: ComponentNode, ctx: ComponentRenderContext): RenderResult,
}
