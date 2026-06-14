import {
	RESOURCE_DETAIL_TEMPLATE, RESOURCE_LIST_TEMPLATE, RESOURCE_SPLIT_VIEW_TEMPLATE,
} from '../pageTemplates';
import { renderPage } from '../renderPage';
import { RenderNode } from './renderNode';

import type { RenderResult } from '../core';
import type { AdapterContext } from './registry';
import type { PageNode } from './types';


export { RenderNode };

export type CompiledPage = {
	routePath: string,
	element: RenderResult,
};

export function compilePage(node: PageNode, ctx: AdapterContext): CompiledPage {
	return { routePath: resolveRoutePath(node), element: renderPage(node, ctx) };
}

export function resolveRoutePath(node: PageNode): string {
	if (node.template === RESOURCE_SPLIT_VIEW_TEMPLATE) {
		return `${node.routePath}/:id?`;
	}
	return node.routePath;
}

export const KNOWN_TEMPLATE_IDS = [
	RESOURCE_LIST_TEMPLATE, RESOURCE_DETAIL_TEMPLATE, RESOURCE_SPLIT_VIEW_TEMPLATE,
] as const;
