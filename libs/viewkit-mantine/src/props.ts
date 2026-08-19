import { defineComponent } from '@nikkierp/viewengine/metadata';

import { collapsibleSectionPropsSchema } from './components/collapsibleSection/props';
import { pageHeaderPropsSchema } from './components/pageHeader/props';
import { resourceFormTabsPropsSchema } from './components/resourceFormTabs/props';
import { resourceTablePropsSchema } from './components/resourceTable/props';
import {
	COLLAPSIBLE_SECTION, PAGE_HEADER, RESOURCE_DETAIL_TEMPLATE, RESOURCE_FORM_TABS,
	RESOURCE_LIST_TEMPLATE, RESOURCE_SPLIT_VIEW_TEMPLATE, RESOURCE_TABLE,
} from './ids';
import { resourceDetailPropsSchema } from './pages/resourceDetail/props';
import { resourceListPropsSchema } from './pages/resourceList/props';
import { resourceSplitViewPropsSchema } from './pages/resourceSplitView/props';

import type { CollapsibleSectionPropsInput } from './components/collapsibleSection/props';
import type { PageHeaderPropsInput } from './components/pageHeader/props';
import type { ResourceFormTabsPropsInput } from './components/resourceFormTabs/props';
import type { ResourceTablePropsInput } from './components/resourceTable/props';
import type {
	ResourceDetailProps, ResourceDetailPropsInput,
} from './pages/resourceDetail/props';
import type { ResourceListProps, ResourceListPropsInput } from './pages/resourceList/props';
import type { ResourceSplitViewProps } from './pages/resourceSplitView/props';
import type { ComponentNode, TemplateRef } from '@nikkierp/viewengine/metadata';


/**
 * Typed authoring helpers for this kit's page templates.
 *
 * This module is deliberately React-free and is exposed on its own
 * `@nikkierp/viewkit-mantine/props` subpath: a module's page-definition files
 * need the schemas and builders but must never pull Mantine components into
 * what is supposed to be plain data.
 *
 * Each builder parses eagerly, so a bad page fails where it is authored rather
 * than at render time, and returns a `JSON.stringify`-able object.
 */
export function resourceListProps(input: ResourceListPropsInput): TemplateRef<ResourceListProps> {
	return { template: RESOURCE_LIST_TEMPLATE, props: resourceListPropsSchema.parse(input) };
}

export function resourceDetailProps(input: ResourceDetailPropsInput): TemplateRef<ResourceDetailProps> {
	return { template: RESOURCE_DETAIL_TEMPLATE, props: resourceDetailPropsSchema.parse(input) };
}

export function resourceSplitViewProps(input: {
	primary: TemplateRef<ResourceListProps>,
	secondary: TemplateRef<ResourceDetailProps>,
}): TemplateRef<ResourceSplitViewProps> {
	return { template: RESOURCE_SPLIT_VIEW_TEMPLATE, props: resourceSplitViewPropsSchema.parse(input) };
}

/**
 * A related-records table node, for a resource detail page's `childrenNodes`.
 * Returns a `ComponentNode` rather than a `TemplateRef` — `childrenNodes` takes
 * component nodes, not nested templates.
 */
export function resourceTableNode(input: ResourceTablePropsInput): ComponentNode {
	return defineComponent({
		component: RESOURCE_TABLE,
		props: resourceTablePropsSchema.parse(input) as Record<string, unknown>,
	});
}

/**
 * Wraps nodes in a bordered block. Give it a `header` plus its `translationNs` for a titled,
 * collapsible block — the usual shape for a resource detail page's appended sections — or leave
 * both off for a bare block that is always open.
 */
export function collapsibleSectionNode(
	input: CollapsibleSectionPropsInput, children: ComponentNode[],
): ComponentNode {
	return defineComponent({
		component: COLLAPSIBLE_SECTION,
		props: collapsibleSectionPropsSchema.parse(input) as Record<string, unknown>,
		children,
	});
}

/**
 * A tabbed block for a resource detail page's `childrenNodes`.
 *
 * Children map to `tabs` **by position** — the nth node is the nth tab's body — so pass exactly one
 * node per tab, wrapping a multi-part tab in its own container node.
 *
 * Unlike `collapsibleSectionNode` this renders the enclosing form's action bar, so it belongs
 * inside a resource detail page and nowhere else.
 */
export function resourceFormTabsNode(
	input: ResourceFormTabsPropsInput, children: ComponentNode[],
): ComponentNode {
	return defineComponent({
		component: RESOURCE_FORM_TABS,
		props: resourceFormTabsPropsSchema.parse(input) as unknown as Record<string, unknown>,
		children,
	});
}

/** A page title block. Child nodes render as its action row. */
export function pageHeaderNode(
	input: PageHeaderPropsInput, children: ComponentNode[] = [],
): ComponentNode {
	return defineComponent({
		component: PAGE_HEADER,
		props: pageHeaderPropsSchema.parse(input) as Record<string, unknown>,
		children,
	});
}

export * from './components/collapsibleSection/props';
export * from './components/pageHeader/props';
export * from './components/resourceFormTabs/props';
export * from './components/resourceTable/props';
export * from './pages/resourceDetail/props';
export * from './pages/resourceList/props';
export * from './pages/resourceSplitView/props';
export * from './ids';
