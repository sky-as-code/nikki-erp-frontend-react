import React from 'react';

import type {
	LinkSpec, ResourceDetailContextualActions,
	ResourceDetailStandardActionCommands, SchemaFieldSpec, StatusOption,
} from './props';
import type { ClientErrorItem } from '@nikkierp/common/types';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export type ResourceUpdateContextValue = {
	commands: ResourceDetailStandardActionCommands,
	resource?: Record<string, unknown>,
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
	allStatuses?: StatusOption[],
	currentStatus?: SchemaFieldSpec,
	contextualActions?: ResourceDetailContextualActions,
	titleLvl1?: SchemaFieldSpec,
	titleLvl2?: SchemaFieldSpec,
	backLinkTitle?: LinkSpec,
	childrenNodes?: ComponentNode[],
};

export const ResourceUpdateContext = React.createContext<ResourceUpdateContextValue | undefined>(undefined);

export function useResourceUpdateContext(): ResourceUpdateContextValue {
	const value = React.useContext(ResourceUpdateContext) ?? null;
	if (value === null) {
		throw new Error('useResourceUpdateContext must be used within ResourceUpdate');
	}
	return value;
}
