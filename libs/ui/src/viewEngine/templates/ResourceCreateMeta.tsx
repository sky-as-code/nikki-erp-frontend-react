import React from 'react';

import { ResourceCreateProps, ResourceCreateProvider } from './ResourceCreate';
import { useResourceCreateContext } from './resourceCreateContext';
import { useResourceDetailContext, useResourceDetailTranslationNs } from './ResourceDetailProvider';
import { RESOURCE_CREATE_COLUMN } from '../componentRenderers/resourceCreateColumn';
import { RESOURCE_CREATE_FORM } from '../componentRenderers/resourceCreateForm';
import { RESOURCE_CREATE_HEADER } from '../componentRenderers/resourceCreateHeader';
import { RESOURCE_CREATE_SECTION } from '../componentRenderers/resourceCreateSection';
import { RenderComponentTree } from '../componentRenderers/renderComponent';
import { useCommandBus } from '../../microApp';

import type { ResourceCreateContextValue } from './resourceCreateContext';
import type { AdapterContext } from '../metadata/registry';
import type { ComponentNode, MetadataNode } from '../metadata/types';


/**
 * Metadata-driven replacement for {@link ResourceCreate}: it provides the same
 * {@link ResourceCreateContext} and renders an equivalent default component tree
 * (`resource_create__header` + `resource_create__form` → `resource_create__section`
 * → `resource_create__column`s) through the component registry.
 */
export function ResourceCreateMeta(props: ResourceCreateProps): React.ReactNode {
	return (
		<ResourceCreateProvider {...props}>
			<ResourceCreateMetaContent />
		</ResourceCreateProvider>
	);
}

function ResourceCreateMetaContent(): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const context = useResourceCreateContext();
	const commandBus = useCommandBus();
	const translationNs = useResourceDetailTranslationNs();
	const adapterCtx = React.useMemo<AdapterContext>(
		() => ({ commandBus, translationNs }),
		[commandBus, translationNs],
	);
	const nodes = React.useMemo(() => buildCreateNodes(context), [context]);
	const modelSchema = schemaPack?.modelSchema;

	if (!modelSchema || !context.commands.create) {
		return null;
	}

	return <RenderComponentTree nodes={nodes} ctx={adapterCtx} />;
}

function buildCreateNodes(context: ResourceCreateContextValue): MetadataNode[] {
	const columns: ComponentNode[] = context.blocks.map(block => ({
		type: 'component',
		component: RESOURCE_CREATE_COLUMN,
		props: block as unknown as Record<string, unknown>,
	}));

	return [
		{
			type: 'component',
			component: RESOURCE_CREATE_HEADER,
			props: { titleLvl1: context.titleLvl1, titleLvl3: context.titleLvl3 },
		},
		{
			type: 'component',
			component: RESOURCE_CREATE_FORM,
			children: [
				{ type: 'component', component: RESOURCE_CREATE_SECTION, props: { expanded: true }, children: columns },
			],
		},
	];
}
