import * as dyn from '@nikkierp/common/dynamicModel';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { defineComponent } from '@nikkierp/viewengine/metadata';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';
import { useNavigate } from 'react-router';

import { notifyAfterSaveFailure, useAfterSaveHooks, useFileFieldContributors, withFileFields } from './afterSave';
import {
	ResourceCreateContext, ResourceCreateContextValue, useCreateServerErrors, useResourceCreateContext,
} from './resourceCreateContext';
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
	const afterSave = useAfterSaveHooks();
	const runAfterSave = afterSave.run;
	const navigate = useNavigate();
	const { bindServerErrorSink, routeServerErrors } = useCreateServerErrors();
	const fileFields = useFileFieldContributors();
	const collectFileFields = fileFields.collect;
	const onSubmit = React.useCallback(
		async (data: Record<string, any>) => {
			if (!props.commands.create) {
				return;
			}
			const response = await publishCreate(withFileFields(data, collectFileFields()));
			const created = response.result?.data;
			const clientErrors = response.result?.clientErrors ?? [];
			if (clientErrors.length > 0) {
				routeServerErrors(clientErrors);
				return;
			}
			if (response.error != null || !created?.id) {
				return;
			}
			try {
				await runAfterSave({ id: created.id, etag: created.etag, values: data });
			}
			catch (error) {
				notifyAfterSaveFailure(error);
			}
			navigate(`../${created.id}`, { relative: 'path', replace: true });
		},
		[publishCreate, props.commands.create, runAfterSave, navigate, routeServerErrors, collectFileFields],
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
			registerFileField: fileFields.register,
			bindServerErrorSink,
		}),
		[
			props.commands, props.titleLvl1, props.backLinkTitle, props.createNodes,
			onSubmit, createCmd.isPending, afterSave.isRunning, afterSave.register, bindServerErrorSink,
			fileFields.register,
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
			component: RESOURCE_CREATE_HEADER,
			props: { titleLvl1: context.titleLvl1, backLinkTitle: context.backLinkTitle },
		}),
		defineComponent({
			component: RESOURCE_CREATE_FORM,
			children: context.createNodes ?? [],
		}),
	];
}
