import * as dyn from '@nikkierp/common/dynamicModel';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { defineComponent } from '@nikkierp/viewengine/metadata';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router';

import { useAuditOpen } from './audit/auditOpenStorage';
import { updatablePayload } from './fieldLocks';
import { toV2FormNodes } from './formNodes';
import { useRecordLoadErrors } from './loadErrors';
import { HideWhenNotFound, ResourceNotFound } from './ResourceNotFound';
import { ResourceUpdateContext, ResourceUpdateContextValue, useResourceUpdateContext } from './resourceUpdateContext';
import { withStatusStrip } from './statusPlacement';
import { RESOURCE_DETAIL_AUDIT_LAYOUT, RESOURCE_DETAIL_HEADER_V2, RESOURCE_FORM_V2 } from '../../ids';
import { StandardActionCode, useFieldLocks } from '../../permissions';
import {
	useFileFieldContributors, useUpdateAfterSave, useUpdatePayloadContributors, withFileFields,
} from '../resourceDetail/afterSave';
import { useResourceDetailContext } from '../resourceDetail/ResourceDetailProvider';

import type { StatusPlacement } from './resourceUpdateContext';
import type { ResourceThumbnailSpec } from '../../components/resourceThumbnail/props';
import type {
	LinkSpec, ResourceDetailContextualActions,
	ResourceDetailStandardActionCommands, SchemaFieldSpec, StatusOption,
} from '../resourceDetail/props';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export type ResourceUpdateProps = {
	standardActionCommands: ResourceDetailStandardActionCommands,
	allStatuses?: StatusOption[],
	currentStatus?: SchemaFieldSpec,
	contextualActions?: ResourceDetailContextualActions,
	titleLvl1?: SchemaFieldSpec,
	titleLvl2?: SchemaFieldSpec,
	backLinkTitle?: LinkSpec,
	thumbnail?: ResourceThumbnailSpec,
	statusPlacement?: StatusPlacement,
	childrenNodes?: ComponentNode[],
	/**
	 * Page sections rendered after the update tree, inside its context, and only while the record
	 * exists: Not Found replaces the whole page, not just the header and form.
	 */
	children?: React.ReactNode,
};

/**
 * Provides {@link ResourceUpdateContext} and renders the update component tree
 * (`resource_detail__header` + `resource_form` wrapping the page's `childrenNodes`) through the
 * component registry, followed by `children` while the record exists.
 */
export function ResourceUpdate({ children, ...props }: ResourceUpdateProps): React.ReactNode {
	return (
		<ResourceUpdateProvider {...props}>
			<ResourceUpdateContent />
			<HideWhenNotFound><AfterSections>{children}</AfterSections></HideWhenNotFound>
		</ResourceUpdateProvider>
	);
}

const AfterSectionsSlotContext = React.createContext<HTMLElement | null>(null);

/**
 * Renders the page's own sections (the related tabs) into the audit layout's left parent, after the
 * form's sections, so the Audit panel opens beside them too. A portal moves only the DOM: the React
 * tree, and with it every context, stays where it is, outside the form. Nothing renders until the
 * layout has mounted its slot, so the tabs mount once rather than once here and again there.
 */
function AfterSections({ children }: { children: React.ReactNode }): React.ReactNode {
	const slot = React.useContext(AfterSectionsSlotContext);
	return slot ? createPortal(children, slot) : null;
}

/**
 * The Audit panel's open state, remembered for every detail page, and the element the layout offers
 * {@link AfterSections}.
 */
function useAuditPanelState() {
	const [auditOpen, setAuditOpen] = useAuditOpen();
	const [afterSectionsSlot, setAfterSectionsSlot] = React.useState<HTMLElement | null>(null);
	const [historyVersion, setHistoryVersion] = React.useState(0);
	const bumpHistory = React.useCallback(() => setHistoryVersion(version => version + 1), []);
	return { auditOpen, setAuditOpen, afterSectionsSlot, setAfterSectionsSlot, historyVersion, bumpHistory };
}

/** Fetches the resource and provides {@link ResourceUpdateContext} to its subtree. */
export function ResourceUpdateProvider(
	props: ResourceUpdateProps & { children: React.ReactNode },
): React.ReactNode {
	const commands = props.standardActionCommands;
	const { id } = useParams();
	const { schemaPack } = useResourceDetailContext();
	const getByIdCmd = useCommand<dyn.RestGetOneResponse<any>>(commands.getById ?? '');
	const updateCmd = useCommand<dyn.RestMutateResponse>(commands.update ?? '');
	const publishGet = getByIdCmd.publish;
	const publishUpdate = updateCmd.publish;

	// The BFF's labelled detail (`with_edge_labels`, `RestApi.getByIdLabelled`) selects `*` plus each to-one edge's
	// label field, turning `uom_id` into a `uom: {id, name}` object the view form shows and links, and names the
	// label fields in `meta.edge_labels`. One request, no edge schema lookups in the browser.
	const refresh = React.useCallback(() => {
		if (commands.getById && id && id !== 'new') {
			void publishGet({ id, with_edge_labels: true });
		}
	}, [publishGet, commands.getById, id]);

	React.useEffect(() => { refresh(); }, [refresh]);

	const resource = getByIdCmd.data?.item as Record<string, unknown> | undefined;
	const maskedFields = getByIdCmd.data?.meta?.masked_fields ?? undefined;
	const edgeLabels = getByIdCmd.data?.meta?.edge_labels ?? noEdgeLabels;
	const toUpdatable = useUpdatablePayload(schemaPack, maskedFields);
	const notFound = useRecordLoadErrors(getByIdCmd.clientErrors);
	const afterSave = useUpdateAfterSave(id, resource, refresh);
	const runAfterUpdate = afterSave.runAfterUpdate;
	const payloadContributors = useUpdatePayloadContributors();
	const collectContributions = payloadContributors.collect;
	const {
		register: registerFileField, hasPending: hasPendingFiles, collect: collectFileFields,
	} = useFileFieldContributors();
	const [updateMode, setUpdateMode] = React.useState(false);
	const {
		auditOpen, setAuditOpen, afterSectionsSlot, setAfterSectionsSlot, historyVersion, bumpHistory,
	} = useAuditPanelState();

	// Refreshes only on success: a refetch would wipe the edits to correct. A section may decline the save.
	const onSubmit = React.useCallback(async (data: Record<string, any>): Promise<boolean> => {
		if (!commands.update) return false;
		const contributions = collectContributions();
		const request = { ...data, ...contributions.payload };
		if (!(await contributions.confirm(request))) return false;
		const response = await publishUpdate(toUpdatable(withFileFields(request, collectFileFields())));
		const succeeded = response.error == null && (response.result?.clientErrors.length ?? 0) === 0;
		if (succeeded) {
			contributions.notifySaved();
			await runAfterUpdate(response.result?.data?.etag, data);
			refresh();
		}
		// Reported back so the action bar leaves edit mode only on success, keeping rejected input on screen.
		return succeeded;
	}, [publishUpdate, commands.update, refresh, runAfterUpdate, collectContributions, collectFileFields, toUpdatable]);

	const value = React.useMemo(
		(): ResourceUpdateContextValue => ({
			commands,
			resource,
			maskedFields,
			edgeLabels,
			isReading: getByIdCmd.isPending,
			isWriting: updateCmd.isPending || afterSave.isRunning,
			refresh,
			onSubmit,
			saveClientErrors: updateCmd.clientErrors,
			saveError: updateCmd.error,
			loadError: getByIdCmd.error,
			notFound,
			allStatuses: props.allStatuses,
			currentStatus: props.currentStatus,
			contextualActions: props.contextualActions,
			titleLvl1: props.titleLvl1,
			titleLvl2: props.titleLvl2,
			backLinkTitle: props.backLinkTitle,
			thumbnail: props.thumbnail,
			statusPlacement: props.statusPlacement,
			childrenNodes: props.childrenNodes,
			registerAfterSave: afterSave.register,
			hasPendingAfterSave: afterSave.hasPending,
			submitAfterSaveOnly: afterSave.submitAfterSaveOnly,
			registerFileField, hasPendingFiles,
			registerUpdatePayload: payloadContributors.register,
			hasPendingUpdatePayload: payloadContributors.hasPending,
			updateMode, setUpdateMode,
			auditOpen, setAuditOpen, setAfterSectionsSlot, historyVersion, bumpHistory,
		}),
		[
			commands, resource, maskedFields, edgeLabels, getByIdCmd.isPending, updateCmd.isPending,
			refresh, onSubmit, updateCmd.clientErrors, updateCmd.error, getByIdCmd.error, notFound,
			props.allStatuses, props.currentStatus, props.contextualActions, props.statusPlacement,
			props.titleLvl1, props.titleLvl2, props.backLinkTitle, props.thumbnail, props.childrenNodes,
			afterSave.register, afterSave.hasPending, afterSave.isRunning, afterSave.submitAfterSaveOnly,
			registerFileField, hasPendingFiles, payloadContributors.register, payloadContributors.hasPending,
			updateMode, auditOpen, setAuditOpen, historyVersion, bumpHistory,
		],
	);

	return (
		<ResourceUpdateContext.Provider value={value}>
			<AfterSectionsSlotContext.Provider value={afterSectionsSlot}>
				{props.children}
			</AfterSectionsSlotContext.Provider>
		</ResourceUpdateContext.Provider>
	);
}

/**
 * Narrows an update request to what the caller may write: a caller holding only field-level update
 * grants would otherwise be refused (403) for every untouched field the form sends back.
 */
const noEdgeLabels: Record<string, string> = {};

function useUpdatablePayload(
	schemaPack: ReturnType<typeof useResourceDetailContext>['schemaPack'], maskedFields: string[] | undefined,
): (payload: Record<string, any>) => Record<string, any> {
	const modelSchema = schemaPack?.modelSchema;
	const fieldNames = React.useMemo(() => Object.keys(modelSchema?.fields ?? {}), [modelSchema]);
	const updateLocks = useFieldLocks(schemaPack?.schemaName ?? null, fieldNames, StandardActionCode.Update);
	return React.useCallback(
		(payload: Record<string, any>) => updatablePayload(
			payload, new Set(fieldNames), updateLocks, maskedFields ?? [],
		),
		[fieldNames, updateLocks, maskedFields],
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
	if (context.notFound) {
		return <ResourceNotFound />;
	}

	return <MetaComponent node={nodes} />;
}

function buildUpdateNodes(context: ResourceUpdateContextValue): ComponentNode[] {
	return [
		defineComponent({
			component: RESOURCE_FORM_V2,
			children: [
				// The header is a child of the form, not a sibling before it, so it renders inside
				// `CrudFormProvider`/`ResourceFormViewProvider` — that's what lets its action bar
				// (Update/Save/Cancel etc., relocated here from the section) reach the form runtime
				// and the page-wide edit-mode toggle.
				defineComponent({
					component: RESOURCE_DETAIL_HEADER_V2,
					props: {
						titleLvl1: context.titleLvl1,
						titleLvl2: context.titleLvl2,
						backLinkTitle: context.backLinkTitle,
						thumbnail: context.thumbnail,
					},
				}),
				// Children of the SAME form, not a second `resource_form` of their own: a page
				// authoring a tabbed layout (`resourceFormNode` wrapping `resourceFormTabsNode`)
				// used to have to open its own `RESOURCE_FORM`/`CrudFormProvider` to reach a form
				// runtime here, which left it with a second, disconnected form instance — invisible
				// to the header's now-relocated Save/Cancel/updateMode. Rendering them here instead
				// means one shared `CrudFormProvider` for the whole page, header included. The audit
				// layout around them is the left parent the Audit panel opens beside.
				defineComponent({
					component: RESOURCE_DETAIL_AUDIT_LAYOUT,
					children: withStatusStrip(
						toV2FormNodes(context.childrenNodes) ?? [],
						context.statusPlacement,
						(context.allStatuses ?? []).length > 0,
					),
				}),
			],
		}),
	];
}
