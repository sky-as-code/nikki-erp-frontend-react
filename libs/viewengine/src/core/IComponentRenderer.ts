import type { ContributionId } from './ids';
import type { IViewResolver } from './IViewEngine';
import type { RenderResult } from './renderResult';
import type { StandardSchemaV1 } from './standardSchema';
import type { ComponentNode } from '../metadata/types';


export type ComponentRenderRuntime = {
	children?: ComponentNode[],
	engine: IViewResolver,
};

/**
 * Engine-agnostic renderer for a `"type": "component"` metadata node.
 *
 * Note the signature: `render(props, runtime)`, not `render(node)`. The engine
 * validates `node.props` with `propsSchema` first, so renderers receive typed
 * data and never reach into the raw node.
 */
export interface IComponentRenderer<TProps = any> {
	readonly type: ContributionId;
	/** Optional; when omitted, `node.props ?? {}` is passed through unvalidated. */
	readonly propsSchema?: StandardSchemaV1<unknown, TProps>;
	render(props: TProps, runtime: ComponentRenderRuntime): RenderResult;
}
