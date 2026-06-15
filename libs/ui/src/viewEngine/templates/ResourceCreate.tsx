import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';
import { useNavigate } from 'react-router';

import { ResourceCreateContext, ResourceCreateContextValue, useResourceCreateContext } from './resourceCreateContext';
import { useResourceDetailContext } from './ResourceDetailProvider';
import { useCommand } from '../../hookhoc';
import { MetaComponent } from '../componentRenderers/renderComponent';
import { RESOURCE_CREATE_COLUMN } from '../componentRenderers/resourceCreateColumn';
import { RESOURCE_CREATE_FORM } from '../componentRenderers/resourceCreateForm';
import { RESOURCE_CREATE_HEADER } from '../componentRenderers/resourceCreateHeader';
import { RESOURCE_CREATE_SECTION } from '../componentRenderers/resourceCreateSection';

import type { LinkSpec, OwnPropertySection, ResourceDetailStandardActionCommands, SchemaFieldSpec } from './ResourceDetail';
import type { ComponentNode } from '../metadata/types';


export type ResourceCreateProps = {
	commands: ResourceDetailStandardActionCommands,
	titleLvl1?: SchemaFieldSpec,
	titleLvl3?: LinkSpec,
	blocks: OwnPropertySection[],
};

/**
 * Provides {@link ResourceCreateContext} and renders the default create component tree
 * (`resource_create__header` + `resource_create__form` → `resource_create__section`
 * → `resource_create__column`s) through the component registry.
 */
export function ResourceCreate(props: ResourceCreateProps): React.ReactNode {
	return (
		<ResourceCreateProvider {...props}>
			<ResourceCreateContent />
		</ResourceCreateProvider>
	);
}

/** Wires the create command and provides {@link ResourceCreateContext} to its subtree. */
export function ResourceCreateProvider(
	props: ResourceCreateProps & { children: React.ReactNode },
): React.ReactNode {
	const createCmd = useCommand<dyn.RestCreateResponse>(props.commands.create ?? '');
	const publishCreate = createCmd.publish;
	const onSubmit = React.useCallback(
		(data: Record<string, any>) => {
			if (props.commands.create) {
				void publishCreate(data);
			}
		},
		[publishCreate, props.commands.create],
	);

	useNavigateAfterCreate(createCmd.data?.id);

	const value = React.useMemo(
		(): ResourceCreateContextValue => ({
			commands: props.commands,
			titleLvl1: props.titleLvl1,
			titleLvl3: props.titleLvl3,
			blocks: props.blocks,
			onSubmit,
			isSubmitting: createCmd.isPending,
		}),
		[props.commands, props.titleLvl1, props.titleLvl3, props.blocks, onSubmit, createCmd.isPending],
	);

	return (
		<ResourceCreateContext.Provider value={value}>
			{props.children}
		</ResourceCreateContext.Provider>
	);
}

function useNavigateAfterCreate(createdId: string | undefined): void {
	const navigate = useNavigate();

	React.useEffect(() => {
		if (!createdId) {
			return;
		}
		navigate(`../${createdId}`, { relative: 'path', replace: true });
	}, [createdId, navigate]);
}

function ResourceCreateContent(): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const context = useResourceCreateContext();
	const nodes = React.useMemo(() => buildCreateNodes(context), [context]);
	const modelSchema = schemaPack?.modelSchema;

	if (!modelSchema || !context.commands.create) {
		return null;
	}

	return <MetaComponent node={nodes} />;
}

function buildCreateNodes(context: ResourceCreateContextValue): ComponentNode[] {
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
