import * as dyn from '@nikkierp/common/dynamicModel';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { defineComponent } from '@nikkierp/viewengine/metadata';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';
import { useNavigate } from 'react-router';

import { toV2FormNodes } from './formNodes';
import {
	ResourceCreateContext, ResourceCreateContextValue, useCreateServerErrors, useResourceCreateContext,
} from './resourceCreateContext';
import { RESOURCE_CREATE_FORM_V2, RESOURCE_CREATE_HEADER_V2 } from '../../ids';
import { notifyAfterSaveFailure, useAfterSaveHooks, useUpdatePayloadContributors } from '../resourceDetail/afterSave';
import { useResourceDetailContext } from '../resourceDetail/ResourceDetailProvider';

import type { LinkSpec, ResourceDetailStandardActionCommands, SchemaFieldSpec } from '../resourceDetail/props';
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
	const afterSave = useAfterSaveHooks();
	const runAfterSave = afterSave.run;
	const navigate = useNavigate();
	const { bindServerErrorSink, routeServerErrors } = useCreateServerErrors();
	const payloadContributors = useUpdatePayloadContributors();
	const collectContributions = payloadContributors.collect;
	const onSubmit = React.useCallback(
		async (data: Record<string, any>) => {
			if (!props.commands.create) {
				return;
			}
			const contributions = collectContributions();
			const response = await publishCreate({ ...data, ...contributions.payload });
			const created = response.result?.data;
			const clientErrors = response.result?.clientErrors ?? [];
			if (clientErrors.length > 0) {
				routeServerErrors(clientErrors);
				return;
			}
			if (response.error != null || !created?.id) {
				return;
			}
			contributions.notifySaved();
			try {
				await runAfterSave({ id: created.id, etag: created.etag, values: data });
			}
			catch (error) {
				notifyAfterSaveFailure(error);
			}
			navigate(`../${created.id}`, { relative: 'path', replace: true });
		},
		[publishCreate, props.commands.create, runAfterSave, navigate, routeServerErrors, collectContributions],
	);

	const value = React.useMemo(
		(): ResourceCreateContextValue => ({
			commands: props.commands,
			titleLvl1: props.titleLvl1,
			backLinkTitle: props.backLinkTitle,
			createNodes: props.createNodes,
			onSubmit,
			isSubmitting: createCmd.isPending || afterSave.isRunning,
			registerAfterSave: afterSave.register,
			registerCreatePayload: payloadContributors.register,
			saveClientErrors: createCmd.clientErrors,
			bindServerErrorSink,
		}),
		[
			props.commands, props.titleLvl1, props.backLinkTitle, props.createNodes,
			onSubmit, createCmd.isPending, afterSave.isRunning, afterSave.register, bindServerErrorSink,
			payloadContributors.register, createCmd.clientErrors,
		],
	);

	return (
		<ResourceCreateContext.Provider value={value}>
			{props.children}
		</ResourceCreateContext.Provider>
	);
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
			component: RESOURCE_CREATE_HEADER_V2,
			props: { titleLvl1: context.titleLvl1, backLinkTitle: context.backLinkTitle },
		}),
		defineComponent({
			component: RESOURCE_CREATE_FORM_V2,
			children: toV2FormNodes(context.createNodes) ?? [],
		}),
	];
}
