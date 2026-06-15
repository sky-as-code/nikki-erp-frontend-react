import React from 'react';

import { usePageContext } from '../core';
import { getComponentRenderer } from './registry';

import type { ComponentNode } from '../metadata/types';


/**
 * Render one or more `"type": "component"` metadata nodes. Each component is
 * validated to be inside a page via the page context; if it is not, or no
 * renderer is registered, it is skipped with a `console.warn`.
 */
export function MetaComponent({ node }: {
	node: ComponentNode | ComponentNode[] | undefined,
}): React.ReactNode {
	if (!node) {
		return null;
	}
	if (Array.isArray(node)) {
		if (node.length === 0) {
			return null;
		}
		return (
			<>
				{node.map((item, index) => <MetaComponent key={index} node={item} />)}
			</>
		);
	}
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
	return renderer.render(node);
}
