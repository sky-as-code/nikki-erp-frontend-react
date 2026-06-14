import { Stack, Text, Title } from '@mantine/core';
import React from 'react';

import type { AdapterContext } from './registry';
import type { FieldBlockNode, MetadataNode, SectionNode } from './types';
import { useDynamicModel } from '../../hookhoc/useDynamicModel';
import { useLocalize, useTranslate } from '../../i18n';


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
