import type { ComponentNode, PageNode, TemplateRef } from './types';
import type { ContributionId } from '../core/ids';


/**
 * Authoring helpers. Metadata is plain JSON on the wire; first-party authors
 * should not hand-write it, so kits expose typed builders that return exactly
 * these shapes. The result of every builder must stay `JSON.stringify`-able.
 */
export function definePage<TProps>(node: {
	routePath: string,
	template: ContributionId,
	props: TProps,
	children?: ComponentNode[],
}): PageNode {
	return { type: 'page', ...node };
}

export function defineCustomPage(node: {
	routePath: string,
	children: ComponentNode[],
}): PageNode {
	return { type: 'page', ...node };
}

export function defineComponent<TProps extends Record<string, unknown>>(node: {
	component: ContributionId,
	props?: TProps,
	children?: ComponentNode[],
}): ComponentNode {
	return { type: 'component', ...node };
}

export function defineTemplateRef<TProps>(template: ContributionId, props: TProps): TemplateRef<TProps> {
	return { template, props };
}
