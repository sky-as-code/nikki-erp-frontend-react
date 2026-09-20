import { RESOURCE_FORM_COLUMN, RESOURCE_FORM_COLUMN_V2 } from '../../ids';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Retargets page-authored form columns onto the v2 renderer.
 *
 * Pages build their sections with the shared `resourceFormColumnNode()`, which emits the v1 id --
 * that is the authoring surface, and v2 must not force every page to relearn it. A v2 column
 * renderer registered under its own id would therefore never be reached, so the template swaps the
 * ids in the node tree it renders. Everything else in the tree is passed through untouched.
 */
export function toV2FormNodes(nodes: ComponentNode[] | undefined): ComponentNode[] | undefined {
	return nodes && retargetColumns(nodes);
}

function retargetColumns(nodes: ComponentNode[]): ComponentNode[] {
	return nodes.map(node => retargetNode(node));
}

function retargetNode(node: ComponentNode): ComponentNode {
	const next: ComponentNode = node.component === RESOURCE_FORM_COLUMN
		? { ...node, component: RESOURCE_FORM_COLUMN_V2 }
		: node;
	const children = next.children && retargetColumns(next.children);
	// A column reached through `tabs[].content` lives in `props`, not `children`, so the props of
	// every node are walked too -- the same traversal `resourceDetailHeader` does to collect them.
	const props = next.props && (retargetValue(next.props) as Record<string, unknown>);
	return { ...next, ...(children ? { children } : {}), ...(props ? { props } : {}) };
}

function retargetValue(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(retargetValue);
	}
	if (value === null || typeof value !== 'object') {
		return value;
	}
	const node = value as Partial<ComponentNode>;
	if (typeof node.component === 'string') {
		return retargetNode(value as ComponentNode);
	}
	return Object.fromEntries(
		Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, retargetValue(item)]),
	);
}
