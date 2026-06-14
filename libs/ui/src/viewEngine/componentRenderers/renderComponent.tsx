import React from 'react';

import { usePageContext } from '../core';
import { getComponentRenderer } from './registry';
import { RenderNode } from '../metadata/renderNode';

import type { RenderResult } from '../core';
import type { AdapterContext } from '../metadata/registry';
import type { ComponentNode, MetadataNode } from '../metadata/types';



/**
 * Render a `"type": "component"` metadata node. The component is validated to be
 * inside a page via the page context; if it is not, or no renderer is
 * registered, it is skipped with a `console.warn`.
 */
export function renderComponent(node: ComponentNode, ctx: AdapterContext): RenderResult {
	return <ComponentHost node={node} ctx={ctx} />;
}

function ComponentHost({ node, ctx }: { node: ComponentNode, ctx: AdapterContext }): React.ReactNode {
	const page = usePageContext();
	if (!page) {
		console.warn(`Component "${node.component}" rendered outside a page; skipped.`);
		return null;
	}
	const renderer = getComponentRenderer(node.component);
	if (!renderer) {
		console.warn(`No component renderer registered for "${node.component}".`);
		return null;
	}
	return renderer.render(node, { ctx });
}

/**
 * Render a children list: `"type": "component"` nodes go through the component
 * registry; legacy `section`/`field_block` nodes fall back to {@link RenderNode}
 * so hand-appended metadata renders alongside declarative components.
 */
export function RenderComponentTree({ nodes, ctx }: {
	nodes?: MetadataNode[],
	ctx: AdapterContext,
}): React.ReactNode {
	if (!nodes || nodes.length === 0) {
		return null;
	}
	return (
		<>
			{nodes.map((node, index) => (node.type === 'component'
				? <React.Fragment key={index}>{renderComponent(node, ctx)}</React.Fragment>
				: <RenderNode key={index} node={node} ctx={ctx} />))}
		</>
	);
}
