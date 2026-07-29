import type { ContributionId } from '../core/ids';


/**
 * Framework-agnostic page description. A page may either reference a registered
 * `template` (optionally with appended `children`) or be fully custom (no
 * `template`, only `children`).
 *
 * Every field here must survive `JSON.parse(JSON.stringify(node))`. Class
 * instances, functions and live objects are not valid metadata.
 */
export type MetadataNode = PageNode | ComponentNode;

export type PageNode = {
	type: 'page',
	routePath: string,
	template?: ContributionId,
	props?: unknown,
	children?: ComponentNode[],
};

/**
 * An inline component rendered by a registered component renderer. Components
 * are only valid inside a page (validated via the page context at render time).
 */
export type ComponentNode = {
	type: 'component',
	component: ContributionId,
	props?: Record<string, unknown>,
	children?: ComponentNode[],
};

/**
 * A nested template invocation carried inside another template's props. This is
 * what lets a split-view template host any registered list template -- including
 * a third party's -- instead of hard-coding one concrete props class.
 */
export type TemplateRef<TProps = unknown> = {
	template: ContributionId,
	props?: TProps,
};

/** Serializable authoring form of a field renderer; resolved at render time. */
export type FieldRendererSpec = {
	renderer: string,
	[key: string]: unknown,
};
