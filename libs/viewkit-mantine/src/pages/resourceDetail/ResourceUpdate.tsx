import * as dyn from '@nikkierp/common/dynamicModel';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { defineComponent } from '@nikkierp/viewengine/metadata';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';
import { useParams } from 'react-router';

import { useResourceDetailContext } from './ResourceDetailProvider';
import { ResourceUpdateContext, ResourceUpdateContextValue, useResourceUpdateContext } from './resourceUpdateContext';
import { RESOURCE_DETAIL_HEADER, RESOURCE_FORM } from '../../ids';

import type {
	LinkSpec, ResourceDetailContextualActions,
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
	backLinkTitle?: LinkSpec,
	childrenNodes?: ComponentNode[],
};

/**
 * Provides {@link ResourceUpdateContext} and renders the update component tree
 * (`resource_detail__header` + `resource_form` wrapping the page's `childrenNodes`) through the
 * component registry.
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
	const onSubmit = React.useCallback(async (data: Record<string, any>): Promise<boolean> => {
		if (!commands.update) return false;
		const response = await publishUpdate(data);
		const succeeded = response.error == null && (response.result?.clientErrors.length ?? 0) === 0;
		if (succeeded) {
			refresh();
		}
		// Reported back so the action bar can leave edit mode only on success: a rejected save has
		// to keep the user's input on screen, since that is exactly what they need to correct.
		return succeeded;
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
			backLinkTitle: props.backLinkTitle,
			childrenNodes: props.childrenNodes,
		}),
		[
			commands, resource, getByIdCmd.isPending, updateCmd.isPending, refresh, onSubmit,
			updateCmd.clientErrors, updateCmd.error, getByIdCmd.error,
			props.allStatuses, props.currentStatus, props.contextualActions,
			props.titleLvl1, props.titleLvl2, props.backLinkTitle, props.childrenNodes,
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
	return [
		defineComponent({
			component: RESOURCE_FORM,
			children: [
				// The header is a child of the form, not a sibling before it, so it renders inside
				// `CrudFormProvider`/`ResourceFormViewProvider` — that's what lets its action bar
				// (Update/Save/Cancel etc., relocated here from the section) reach the form runtime
				// and the page-wide edit-mode toggle.
				defineComponent({
					component: RESOURCE_DETAIL_HEADER,
					props: {
						titleLvl1: context.titleLvl1,
						titleLvl2: context.titleLvl2,
						backLinkTitle: context.backLinkTitle,
					},
				}),
				// Children of the SAME form, not a second `resource_form` of their own: a page
				// authoring a tabbed layout (`resourceFormNode` wrapping `resourceFormTabsNode`)
				// used to have to open its own `RESOURCE_FORM`/`CrudFormProvider` to reach a form
				// runtime here, which left it with a second, disconnected form instance — invisible
				// to the header's now-relocated Save/Cancel/updateMode. Rendering them here instead
				// means one shared `CrudFormProvider` for the whole page, header included.
				...(context.childrenNodes ?? []),
			],
		}),
	];
}
