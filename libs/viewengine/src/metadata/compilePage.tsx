import React from 'react';

import { MetaPage } from '../render/renderPage';

import type { IViewResolver, RenderResult } from '../core';
import type { PageNode } from './types';


export type CompiledPage = {
	routePath: string,
	element: RenderResult,
};

export function compilePage(node: PageNode, engine: IViewResolver): CompiledPage {
	return {
		routePath: resolveRoutePath(node, engine),
		// Keyed by route path so React remounts on navigation between pages instead of reusing the
		// same fiber (and its hook state) across two pages that happen to render through the same
		// template — the router's own `<AppRoute key=.../>` cannot provide this: `AppRoutes`'s
		// children are read by a manual tree-walk, never by React's reconciler, so that `key` is
		// inert and the element react-router actually renders at the matched outlet carries none.
		element: <MetaPage key={node.routePath} node={node} />,
	};
}

/**
 * The route shape is contributed by the template, never hard-coded here. The
 * previous implementation special-cased the split-view template id, which meant
 * the engine core imported a constant owned by one concrete kit.
 */
export function resolveRoutePath(node: PageNode, engine: IViewResolver): string {
	if (!node.template) {
		return node.routePath;
	}
	return engine.getPageTemplate(node.template)?.routePattern?.(node) ?? node.routePath;
}
