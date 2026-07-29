import React from 'react';

import type {
	LinkSpec, OwnPropertySection, ResourceDetailContextualActions,
	ResourceDetailStandardActionCommands, SchemaFieldSpec, StatusOption,
} from './props';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export type ResourceUpdateContextValue = {
	commands: ResourceDetailStandardActionCommands,
	resource?: Record<string, unknown>,
	isReading: boolean,
	isWriting: boolean,
	refresh: () => void,
	onSubmit: (data: Record<string, any>) => void,
	allStatuses?: StatusOption[],
	currentStatus?: SchemaFieldSpec,
	contextualActions?: ResourceDetailContextualActions,
	titleLvl1?: SchemaFieldSpec,
	titleLvl2?: SchemaFieldSpec,
	titleLvl3?: LinkSpec,
	blocks: OwnPropertySection[],
	childrenNodes?: ComponentNode[],
};

export const ResourceUpdateContext = React.createContext<ResourceUpdateContextValue | undefined>(undefined);

export function useResourceUpdateContext(): ResourceUpdateContextValue {
	const value = React.useContext(ResourceUpdateContext);
	if (value === undefined) {
		throw new Error('useResourceUpdateContext must be used within ResourceUpdate');
	}
	return value;
}
