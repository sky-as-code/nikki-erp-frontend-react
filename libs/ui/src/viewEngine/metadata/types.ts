/**
 * Framework-agnostic page description. A page may either reference a predefined
 * `template` (optionally with appended `children`) or be fully custom (no
 * `template`, only `children`). Sections and field blocks nest arbitrarily.
 */
export type MetadataNode = PageNode | SectionNode | FieldBlockNode | ComponentNode;

export type PageNode = {
	type: 'page',
	routePath: string,
	template?: string,
	props?: Record<string, unknown>,
	children?: MetadataNode[],
};

export type SectionNode = {
	type: 'section',
	props: {
		title?: string,
		children?: MetadataNode[],
	},
};

export type FieldBlockNode = {
	type: 'field_block',
	props: {
		resource: string,
		fields: string[],
	},
};

/**
 * An inline component rendered by a registered component renderer. Components
 * are only valid inside a page (validated via the page context at render time).
 */
export type ComponentNode = {
	type: 'component',
	component: string,
	props?: Record<string, unknown>,
	children?: MetadataNode[],
};
