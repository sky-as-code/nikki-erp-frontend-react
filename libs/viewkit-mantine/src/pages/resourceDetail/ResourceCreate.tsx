import * as dyn from '@nikkierp/common/dynamicModel';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { defineComponent } from '@nikkierp/viewengine/metadata';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';
import { useNavigate } from 'react-router';

import { ResourceCreateContext, ResourceCreateContextValue, useResourceCreateContext } from './resourceCreateContext';
import { useResourceDetailContext } from './ResourceDetailProvider';
import { RESOURCE_CREATE_FORM, RESOURCE_CREATE_HEADER } from '../../ids';

import type { LinkSpec, ResourceDetailStandardActionCommands, SchemaFieldSpec } from './props';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export type ResourceCreateProps = {
	commands: ResourceDetailStandardActionCommands,
	titleLvl1?: SchemaFieldSpec,
	backLinkTitle?: LinkSpec,
	createNodes?: ComponentNode[],
};

/**
 * Provides {@link ResourceCreateContext} and renders the create component tree
 * (`resource_create__header` + `resource_create__form` wrapping the page's `createNodes`)
 * through the component registry.
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
			backLinkTitle: props.backLinkTitle,
			createNodes: props.createNodes,
			onSubmit,
			isSubmitting: createCmd.isPending,
		}),
		[
			props.commands, props.titleLvl1, props.backLinkTitle, props.createNodes,
			onSubmit, createCmd.isPending,
		],
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
	return [
		defineComponent({
			component: RESOURCE_CREATE_HEADER,
			props: { titleLvl1: context.titleLvl1, backLinkTitle: context.backLinkTitle },
		}),
		defineComponent({
			component: RESOURCE_CREATE_FORM,
			children: context.createNodes ?? [],
		}),
	];
}
