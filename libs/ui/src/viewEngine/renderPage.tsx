import { Stack, Text } from '@mantine/core';
import React from 'react';

import { PageContextProvider } from './core';
import { RenderNode } from './metadata/renderNode';
import { getPageTemplate } from './pageTemplates';

import type { RenderResult } from './core';
import type { AdapterContext } from './metadata/registry';
import type { MetadataNode, PageNode } from './metadata/types';



/**
 * Render a `"type": "page"` metadata node into a RenderResult. A page either
 * references a registered `template` (with optional appended `children`) or is
 * fully custom (no `template`, only `children`).
 */
export function renderPage(node: PageNode, ctx: AdapterContext): RenderResult {
	const body = node.template
		? renderTemplatePage(node, ctx)
		: <CustomPage nodes={node.children ?? []} ctx={ctx} />;
	return <PageContextProvider value={{ templateId: node.template }}>{body}</PageContextProvider>;
}

function renderTemplatePage(node: PageNode, ctx: AdapterContext): RenderResult {
	const template = getPageTemplate(node.template!);
	if (!template) {
		return <UnknownTemplate templateId={node.template!} />;
	}
	const props = template.createProps(node.props, ctx, node.children);
	return template.render(props, { routePath: node.routePath, ctx, childrenNodes: node.children });
}

function CustomPage({ nodes, ctx }: { nodes: MetadataNode[], ctx: AdapterContext }): React.ReactNode {
	return (
		<Stack className='absolute top-0 left-0 right-0 bottom-0 p-0 m-0 px-4 pb-4 flex overflow-auto' gap='md'>
			{nodes.map((child, index) => <RenderNode key={index} node={child} ctx={ctx} />)}
		</Stack>
	);
}

function UnknownTemplate({ templateId }: { templateId: string }): React.ReactNode {
	return <Text c='red'>{`Unknown template: ${templateId}`}</Text>;
}
