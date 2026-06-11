/**
 * Framework-agnostic page description. A page may either reference a predefined
 * `template` (optionally with appended `children`) or be fully custom (no
 * `template`, only `children`). Sections and field blocks nest arbitrarily.
 */
export type MetadataNode = PageNode | SectionNode | FieldBlockNode;

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
