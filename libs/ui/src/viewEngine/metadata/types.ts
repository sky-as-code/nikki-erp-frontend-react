/**
 * Framework-agnostic page description. A page may either reference a predefined
 * `template` (optionally with appended `children`) or be fully custom (no
 * `template`, only `children`).
 */
export type MetadataNode = PageNode | ComponentNode;

export type PageNode = {
	type: 'page',
	routePath: string,
	template?: string,
	props?: unknown,
	children?: ComponentNode[],
};

/**
 * An inline component rendered by a registered component renderer. Components
 * are only valid inside a page (validated via the page context at render time).
 */
export type ComponentNode = {
	type: 'component',
	component: string,
	props?: Record<string, unknown>,
	children?: ComponentNode[],
};
