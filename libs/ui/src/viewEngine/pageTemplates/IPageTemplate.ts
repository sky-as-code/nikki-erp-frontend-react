import type { IPageProps, RenderResult } from '../core';
import type { ComponentNode } from '../metadata/types';


/** Runtime data handed to a page template alongside its typed props. */
export type PageRenderRuntime = {
	routePath: string,
	childrenNodes?: ComponentNode[],
};

/**
 * Engine-agnostic page template descriptor stored in the page template registry.
 * `createProps` adapts serializable JSON props into a strongly-typed IPageProps
 * instance; `render` turns that instance into a RenderResult. The metadata JSON,
 * this registry, and the MetaPage signature stay stable across rendering engines.
 */
export interface IPageTemplate<TProps extends IPageProps = IPageProps> {
	readonly id: string,
	createProps(
		json: unknown,
		childrenNodes?: ComponentNode[],
	): TProps,
	render(props: TProps, runtime: PageRenderRuntime): RenderResult,
}
