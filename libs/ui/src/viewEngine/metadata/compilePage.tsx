import { Stack, Text, Title } from '@mantine/core';
import React from 'react';

import {
	AdapterContext, getTemplate, RESOURCE_DETAIL_TEMPLATE, RESOURCE_LIST_TEMPLATE, RESOURCE_SPLIT_VIEW_TEMPLATE,
} from './registry';
import { FieldBlockNode, MetadataNode, PageNode, SectionNode } from './types';
import { useDynamicModel } from '../../hookhoc/useDynamicModel';
import { useTranslate, useLocalize } from '../../i18n';


export type CompiledPage = {
	routePath: string,
	element: React.ReactNode,
};

export function compilePage(node: PageNode, ctx: AdapterContext): CompiledPage {
	const routePath = resolveRoutePath(node);
	if (node.template) {
		return { routePath, element: renderTemplatePage(node, ctx) };
	}
	return { routePath, element: <CustomPage nodes={node.children ?? []} ctx={ctx} /> };
}

export function resolveRoutePath(node: PageNode): string {
	if (node.template === RESOURCE_SPLIT_VIEW_TEMPLATE) {
		return `${node.routePath}/:id?`;
	}
	return node.routePath;
}

function renderTemplatePage(node: PageNode, ctx: AdapterContext): React.ReactNode {
	const entry = getTemplate(node.template!);
	if (!entry) {
		return <UnknownTemplate templateId={node.template!} />;
	}
	const adapted = entry.adaptProps ? entry.adaptProps(node.props, ctx) : node.props;
	const Component = entry.Component;
	return <Component props={adapted} routePath={node.routePath} childrenNodes={node.children} ctx={ctx} />;
}

function CustomPage({ nodes, ctx }: { nodes: MetadataNode[], ctx: AdapterContext }): React.ReactNode {
	return (
		<Stack className='absolute top-0 left-0 right-0 bottom-0 p-0 m-0 px-4 pb-4 flex overflow-auto' gap='md'>
			{nodes.map((child, index) => <RenderNode key={index} node={child} ctx={ctx} />)}
		</Stack>
	);
}

export function RenderNode({ node, ctx }: { node: MetadataNode, ctx: AdapterContext }): React.ReactNode {
	switch (node.type) {
		case 'section': return <MetadataSection node={node} ctx={ctx} />;
		case 'field_block': return <FieldBlock node={node} ctx={ctx} />;
		default: return null;
	}
}

function MetadataSection({ node, ctx }: { node: SectionNode, ctx: AdapterContext }): React.ReactNode {
	const t = useTranslate(ctx.translationNs ?? 'common');
	const children = node.props.children ?? [];
	return (
		<Stack gap='sm'>
			{node.props.title ? <Title order={4}>{t(node.props.title)}</Title> : null}
			{children.map((child, index) => <RenderNode key={index} node={child} ctx={ctx} />)}
		</Stack>
	);
}

function FieldBlock({ node, ctx }: { node: FieldBlockNode, ctx: AdapterContext }): React.ReactNode {
	const pack = useDynamicModel(node.props.resource);
	const localize = useLocalize(ctx.translationNs ?? 'common');
	const modelSchema = pack?.modelSchema;
	if (!modelSchema) {
		return null;
	}
	return (
		<Stack gap='sm'>
			{node.props.fields.map(field => (
				<Stack key={field} gap={4}>
					<Text size='md' fw='bold'>{localize(modelSchema.fields[field]?.label)}</Text>
				</Stack>
			))}
		</Stack>
	);
}

function UnknownTemplate({ templateId }: { templateId: string }): React.ReactNode {
	return <Text c='red'>{`Unknown template: ${templateId}`}</Text>;
}

export const KNOWN_TEMPLATE_IDS = [
	RESOURCE_LIST_TEMPLATE, RESOURCE_DETAIL_TEMPLATE, RESOURCE_SPLIT_VIEW_TEMPLATE,
] as const;
