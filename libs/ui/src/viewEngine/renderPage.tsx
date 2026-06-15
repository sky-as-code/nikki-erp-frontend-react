import { Stack, Text } from '@mantine/core';
import React from 'react';

import { MetaComponent } from './componentRenderers/renderComponent';
import { PageContextProvider } from './core';
import { getPageTemplate } from './pageTemplates';

import type { RenderResult } from './core';
import type { ComponentNode, PageNode } from './metadata/types';


/**
 * Render a `"type": "page"` metadata node. A page either references a registered
 * `template` (with optional appended `children`) or is fully custom (no
 * `template`, only `children`).
 */
export function MetaPage({ node }: { node: PageNode }): RenderResult {
	const body = node.template
		? <TemplatePage node={node} />
		: <CustomPage nodes={node.children ?? []} />;
	return <PageContextProvider value={{ templateId: node.template }}>{body}</PageContextProvider>;
}

function TemplatePage({ node }: { node: PageNode }): RenderResult {
	const template = getPageTemplate(node.template!);
	if (!template) {
		return <UnknownTemplate templateId={node.template!} />;
	}
	const props = template.createProps(node.props, node.children);
	return template.render(props, { routePath: node.routePath, childrenNodes: node.children });
}

function CustomPage({ nodes }: { nodes: ComponentNode[] }): React.ReactNode {
	return (
		<Stack className='absolute top-0 left-0 right-0 bottom-0 p-0 m-0 px-4 pb-4 flex overflow-auto' gap='md'>
			<MetaComponent node={nodes} />
		</Stack>
	);
}

function UnknownTemplate({ templateId }: { templateId: string }): React.ReactNode {
	return <Text c='red'>{`Unknown template: ${templateId}`}</Text>;
}
