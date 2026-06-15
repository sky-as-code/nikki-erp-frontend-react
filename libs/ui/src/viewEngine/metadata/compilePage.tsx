import React from 'react';

import {
	RESOURCE_DETAIL_TEMPLATE, RESOURCE_LIST_TEMPLATE, RESOURCE_SPLIT_VIEW_TEMPLATE,
} from '../pageTemplates';
import { MetaPage } from '../renderPage';

import type { RenderResult } from '../core';
import type { PageNode } from './types';

export type CompiledPage = {
	routePath: string,
	element: RenderResult,
};

export function compilePage(node: PageNode): CompiledPage {
	return { routePath: resolveRoutePath(node), element: <MetaPage node={node} /> };
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
