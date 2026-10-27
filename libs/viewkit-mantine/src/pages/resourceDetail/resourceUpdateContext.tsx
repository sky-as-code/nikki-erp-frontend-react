import React from 'react';

import type { RegisterAfterSave, RegisterFileField, RegisterUpdatePayload } from './afterSave';
import type {
	LinkSpec, ResourceDetailContextualActions,
	ResourceDetailStandardActionCommands, SchemaFieldSpec, StatusOption,
} from './props';
import type { ResourceThumbnailSpec } from '../../components/resourceThumbnail/props';
import type { ClientErrorItem } from '@nikkierp/common/types';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export type ResourceUpdateContextValue = {
	commands: ResourceDetailStandardActionCommands,
	resource?: Record<string, unknown>,
	/**
	 * Fields the server blanked in `resource` because the caller may not read them
	 * (`meta.masked_fields`): rendered locked, and never sent back on save.
	 */
	maskedFields?: string[],
	/**
	 * `{<edge>: <label field>}` from the BFF's labelled detail (`meta.edge_labels`): which field of
	 * each to-one edge object on `resource` is its label. Empty until the record loads.
	 */
	edgeLabels: Record<string, string>,
	isReading: boolean,
	isWriting: boolean,
	refresh: () => void,
	/** Resolves whether the write succeeded, so callers can leave edit mode only on success. */
	onSubmit: (data: Record<string, any>) => Promise<boolean>,
	/** Server-side rejections from the last save. Empty until one occurs. */
	saveClientErrors: ClientErrorItem[],
	/** Technical failure from the last save or load, if any. */
	saveError: unknown | null,
	loadError: unknown | null,
	/** v2 only: the record fetch answered not-found, so the page renders a 404 state instead. */
	notFound?: boolean,
	allStatuses?: StatusOption[],
	currentStatus?: SchemaFieldSpec,
	contextualActions?: ResourceDetailContextualActions,
	titleLvl1?: SchemaFieldSpec,
	titleLvl2?: SchemaFieldSpec,
	backLinkTitle?: LinkSpec,
	/** v2 only: the photo the header shows left of the titles. */
	thumbnail?: ResourceThumbnailSpec,
	childrenNodes?: ComponentNode[],
	registerAfterSave: RegisterAfterSave,
	hasPendingAfterSave: () => boolean,
	submitAfterSaveOnly: () => Promise<boolean>,
	/** A file field's staged edit, sent in the update request itself (multipart when a file is chosen). */
	registerFileField: RegisterFileField,
	hasPendingFiles: () => boolean,
	/** Optional because only the v2 update provider merges contributions into its request. */
	registerUpdatePayload?: RegisterUpdatePayload,
	hasPendingUpdatePayload?: () => boolean,
	/**
	 * v2 only: the page-wide edit mode, which the form adopts. Lifted here so a section outside the
	 * form -- the related tabs -- can hide its navigation while the form holds unsaved edits.
	 */
	updateMode?: boolean,
	setUpdateMode?: React.Dispatch<React.SetStateAction<boolean>>,
};

export const ResourceUpdateContext = React.createContext<ResourceUpdateContextValue | undefined>(undefined);

export function useResourceUpdateContext(): ResourceUpdateContextValue {
	const value = React.useContext(ResourceUpdateContext) ?? null;
	if (value === null) {
		throw new Error('useResourceUpdateContext must be used within ResourceUpdate');
	}
	return value;
}

/**
 * The update context, or `undefined` outside an update page: for a component the create page renders
 * too, such as a custom block declared once for both.
 */
export function useOptionalResourceUpdateContext(): ResourceUpdateContextValue | undefined {
	return React.useContext(ResourceUpdateContext);
}
