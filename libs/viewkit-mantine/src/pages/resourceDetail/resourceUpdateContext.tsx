import React from 'react';

import type { RegisterAfterSave, RegisterUpdatePayload } from './afterSave';
import type {
	LinkSpec, ResourceDetailContextualActions,
	ResourceDetailStandardActionCommands, SchemaFieldSpec, StatusOption,
} from './props';
import type { ResourceThumbnailSpec } from '../../components/resourceThumbnail/props';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { ClientErrorItem } from '@nikkierp/common/types';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export type ResourceUpdateContextValue = {
	commands: ResourceDetailStandardActionCommands,
	resource?: Record<string, unknown>,
	/**
	 * The schemas this resource's to-one edges point at, keyed by name.
	 *
	 * Resolved once by the provider to build the detail fetch's `fields`, and shared here so the
	 * read-mode fields can render each edge's label without fetching them a second time.
	 */
	edgeSchemas: Record<string, dyn.ModelSchema>,
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
	/** Optional because only the v2 update provider merges contributions into its request. */
	registerUpdatePayload?: RegisterUpdatePayload,
	hasPendingUpdatePayload?: () => boolean,
};

export const ResourceUpdateContext = React.createContext<ResourceUpdateContextValue | undefined>(undefined);

export function useResourceUpdateContext(): ResourceUpdateContextValue {
	const value = React.useContext(ResourceUpdateContext) ?? null;
	if (value === null) {
		throw new Error('useResourceUpdateContext must be used within ResourceUpdate');
	}
	return value;
}
