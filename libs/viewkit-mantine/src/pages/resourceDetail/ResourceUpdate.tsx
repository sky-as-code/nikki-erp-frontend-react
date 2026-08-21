import * as dyn from '@nikkierp/common/dynamicModel';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { defineComponent } from '@nikkierp/viewengine/metadata';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';
import { useParams } from 'react-router';

import { useResourceDetailContext } from './ResourceDetailProvider';
import { ResourceUpdateContext, ResourceUpdateContextValue, useResourceUpdateContext } from './resourceUpdateContext';
import {
	RESOURCE_DETAIL_HEADER, RESOURCE_FORM, RESOURCE_FORM_COLUMN, RESOURCE_FORM_SECTION,
} from '../../ids';

import type {
	LinkSpec, OwnPropertySection, ResourceDetailContextualActions,
	ResourceDetailStandardActionCommands, SchemaFieldSpec, StatusOption,
} from './props';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export type ResourceUpdateProps = {
	standardActionCommands: ResourceDetailStandardActionCommands,
	allStatuses?: StatusOption[],
	currentStatus?: SchemaFieldSpec,
	contextualActions?: ResourceDetailContextualActions,
	titleLvl1?: SchemaFieldSpec,
	titleLvl2?: SchemaFieldSpec,
	titleLvl3?: LinkSpec,
	blocks: OwnPropertySection[],
	childrenNodes?: ComponentNode[],
};

/**
 * Provides {@link ResourceUpdateContext} and renders the default update component tree
 * (`resource_detail__header` + `resource_form` → `resource_form__section` →
 * `resource_form__column`s + appended children) through the component registry.
 */
export function ResourceUpdate(props: ResourceUpdateProps): React.ReactNode {
	return (
		<ResourceUpdateProvider {...props}>
			<ResourceUpdateContent />
		</ResourceUpdateProvider>
	);
}

/** Fetches the resource and provides {@link ResourceUpdateContext} to its subtree. */
export function ResourceUpdateProvider(
	props: ResourceUpdateProps & { children: React.ReactNode },
): React.ReactNode {
	const commands = props.standardActionCommands;
	const { id } = useParams();
	const getByIdCmd = useCommand<dyn.RestGetOneResponse<any>>(commands.getById ?? '');
	const updateCmd = useCommand<dyn.RestMutateResponse>(commands.update ?? '');
	const publishGet = getByIdCmd.publish;
	const publishUpdate = updateCmd.publish;

	const refresh = React.useCallback(() => {
		if (commands.getById && id && id !== 'new') {
			void publishGet({ id });
		}
	}, [publishGet, commands.getById, id]);

	React.useEffect(() => { refresh(); }, [refresh]);

	/**
	 * Refreshes only on success. A failed save must NOT re-fetch: that would replace
	 * the user's unsaved edits with the server's unchanged record, discarding exactly
	 * the input they need to correct.
	 */
	const onSubmit = React.useCallback(async (data: Record<string, any>) => {
		if (!commands.update) return;
		const response = await publishUpdate(data);
		const succeeded = response.error == null && (response.result?.clientErrors.length ?? 0) === 0;
		if (succeeded) {
			refresh();
		}
	}, [publishUpdate, commands.update, refresh]);

	const resource = getByIdCmd.data?.item as Record<string, unknown> | undefined;
	const value = React.useMemo(
		(): ResourceUpdateContextValue => ({
			commands,
			resource,
			isReading: getByIdCmd.isPending,
			isWriting: updateCmd.isPending,
			refresh,
			onSubmit,
			saveClientErrors: updateCmd.clientErrors,
			saveError: updateCmd.error,
			loadError: getByIdCmd.error,
			allStatuses: props.allStatuses,
			currentStatus: props.currentStatus,
			contextualActions: props.contextualActions,
			titleLvl1: props.titleLvl1,
			titleLvl2: props.titleLvl2,
			titleLvl3: props.titleLvl3,
			blocks: props.blocks,
			childrenNodes: props.childrenNodes,
		}),
		[
			commands, resource, getByIdCmd.isPending, updateCmd.isPending, refresh, onSubmit,
			updateCmd.clientErrors, updateCmd.error, getByIdCmd.error,
			props.allStatuses, props.currentStatus, props.contextualActions,
			props.titleLvl1, props.titleLvl2, props.titleLvl3, props.blocks, props.childrenNodes,
		],
	);

	return (
		<ResourceUpdateContext.Provider value={value}>
			{props.children}
		</ResourceUpdateContext.Provider>
	);
}

function ResourceUpdateContent(): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const context = useResourceUpdateContext();
	const nodes = React.useMemo(() => buildUpdateNodes(context), [context]);
	const modelSchema = schemaPack?.modelSchema;

	// `getById` only. A read-only resource declares no update command on purpose — the stock
	// balance is the case in point, since its engine refuses client writes — and requiring one
	// here rendered nothing at all for those pages, hiding their read view and any contextual
	// action along with it. The form itself already renders read-only when no update command
	// exists, so the guard was protecting nothing.
	if (!modelSchema || !context.commands.getById) {
		return null;
	}

	return <MetaComponent node={nodes} />;
}

function buildUpdateNodes(context: ResourceUpdateContextValue): ComponentNode[] {
	const columns = context.blocks.map(block => defineComponent({
		component: RESOURCE_FORM_COLUMN,
		props: block as unknown as Record<string, unknown>,
	}));

	return [
		defineComponent({
			component: RESOURCE_DETAIL_HEADER,
			props: {
				titleLvl1: context.titleLvl1,
				titleLvl2: context.titleLvl2,
				titleLvl3: context.titleLvl3,
			},
		}),
		defineComponent({
			component: RESOURCE_FORM,
			children: [
				// Empty `formSections` (a page whose fields all live in `childrenNodes`, e.g. behind
				// tabs) would otherwise still render this section's own bordered box and action bar
				// with nothing inside it — a redundant, empty collapsible above the real content.
				...(columns.length > 0 ? [defineComponent({
					component: RESOURCE_FORM_SECTION,
					props: { expanded: true },
					children: columns,
				})] : []),
			],
		}),
		// Siblings of the form, not children of its section: the section's inner
		// wrapper is a 2-4 column grid inside the form context, which would squeeze
		// a table into a third of the width and bind it to the form's action bar.
		...(context.childrenNodes ?? []),
	];
}
