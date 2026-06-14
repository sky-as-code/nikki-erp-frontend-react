import React from 'react';

import { useResourceDetailContext, useResourceDetailTranslationNs } from './ResourceDetailProvider';
import { ResourceUpdateProps, ResourceUpdateProvider } from './ResourceUpdate';
import { useResourceUpdateContext } from './resourceUpdateContext';
import { useCommandBus } from '../../microApp';
import { COLLAPSIBLE_SECTION } from '../componentRenderers/collapsibleSection';
import { RenderComponentTree } from '../componentRenderers/renderComponent';
import { RESOURCE_DETAIL_HEADER } from '../componentRenderers/resourceDetailHeader';
import { RESOURCE_FORM } from '../componentRenderers/resourceForm';
import { RESOURCE_FORM_COLUMN } from '../componentRenderers/resourceFormColumn';

import type { ResourceUpdateContextValue } from './resourceUpdateContext';
import type { AdapterContext } from '../metadata/registry';
import type { ComponentNode, MetadataNode } from '../metadata/types';


/**
 * Metadata-driven replacement for {@link ResourceUpdate}: it provides the same
 * {@link ResourceUpdateContext} and renders an equivalent default component tree
 * (`resource_detail__header` + `resource_form` → `collapsible_section` →
 * `resource_form__column`s + appended children) through the component registry.
 */
export function ResourceUpdateMeta(props: ResourceUpdateProps): React.ReactNode {
	return (
		<ResourceUpdateProvider {...props}>
			<ResourceUpdateMetaContent />
		</ResourceUpdateProvider>
	);
}

function ResourceUpdateMetaContent(): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const context = useResourceUpdateContext();
	const commandBus = useCommandBus();
	const translationNs = useResourceDetailTranslationNs();
	const adapterCtx = React.useMemo<AdapterContext>(
		() => ({ commandBus, translationNs }),
		[commandBus, translationNs],
	);
	const nodes = React.useMemo(() => buildUpdateNodes(context), [context]);
	const modelSchema = schemaPack?.modelSchema;

	if (!modelSchema || !context.commands.update || !context.commands.getById) {
		return null;
	}

	return <RenderComponentTree nodes={nodes} ctx={adapterCtx} />;
}

function buildUpdateNodes(context: ResourceUpdateContextValue): MetadataNode[] {
	const columns: ComponentNode[] = context.blocks.map(block => ({
		type: 'component',
		component: RESOURCE_FORM_COLUMN,
		props: block as unknown as Record<string, unknown>,
	}));
	const sectionChildren: MetadataNode[] = [...columns, ...(context.childrenNodes ?? [])];

	return [
		{
			type: 'component',
			component: RESOURCE_DETAIL_HEADER,
			props: {
				titleLvl1: context.titleLvl1,
				titleLvl2: context.titleLvl2,
				titleLvl3: context.titleLvl3,
			},
		},
		{
			type: 'component',
			component: RESOURCE_FORM,
			children: [
				{ type: 'component', component: COLLAPSIBLE_SECTION, props: { expanded: true }, children: sectionChildren },
			],
		},
	];
}
