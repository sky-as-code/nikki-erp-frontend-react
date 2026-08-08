import React from 'react';

import { MetaPage } from '../render/renderPage';

import type { IViewResolver, RenderResult } from '../core';
import type { PageNode } from './types';


export type CompiledPage = {
	routePath: string,
	element: RenderResult,
};

export function compilePage(node: PageNode, engine: IViewResolver): CompiledPage {
	return { routePath: resolveRoutePath(node, engine), element: <MetaPage node={node} /> };
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
