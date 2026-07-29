import type { ContributionId } from './ids';
import type { IViewResolver } from './IViewEngine';
import type { RenderResult } from './renderResult';
import type { StandardSchemaV1 } from './standardSchema';
import type { ComponentNode, PageNode } from '../metadata/types';


/** Runtime data handed to a page template alongside its validated params. */
export type PageRenderRuntime = {
	/** Route path exactly as authored -- without any `routePattern` suffix. */
	routePath: string,
	/** Resolved children component nodes, if the page declared any. */
	childrenNodes?: ComponentNode[],
	/** The engine that resolved this template, for nested `TemplateRef` rendering. */
	engine: IViewResolver,
};

/**
 * Engine-agnostic page template descriptor stored in the page template registry.
 *
 * The engine validates `node.props` with `propsSchema` before the template runs,
 * so a template never sees unvalidated input and never needs an `instanceof`
 * check. `createProps` is for adaptation only (merging children, deriving
 * defaults) and must return plain data.
 */
export interface IPageTemplate<TParams = any> {
	readonly id: ContributionId;

	/**
	 * Validation + defaulting for the page's `props` JSON. Must be a Standard
	 * Schema v1 validator; zod 4 satisfies this natively.
	 */
	readonly propsSchema: StandardSchemaV1<unknown, TParams>;

	/**
	 * Optional post-validation adaptation. Runs AFTER `propsSchema`. Must be
	 * pure and must not return class instances.
	 */
	createProps?(params: TParams, childrenNodes?: ComponentNode[]): TParams;

	/**
	 * Optional route-shape contribution. Returning `undefined` means "use
	 * `node.routePath` verbatim". This is what keeps split-view's `/:id?` out of
	 * the engine core -- a template owns its own route shape, and a wizard or a
	 * calendar template can contribute `/:step?` or `/:year/:month?` the same way.
	 */
	routePattern?(node: PageNode): string | undefined;

	render(params: TParams, runtime: PageRenderRuntime): RenderResult;
}
