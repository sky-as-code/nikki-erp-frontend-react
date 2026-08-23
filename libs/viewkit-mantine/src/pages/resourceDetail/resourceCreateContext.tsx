import React from 'react';

import type { LinkSpec, ResourceDetailStandardActionCommands, SchemaFieldSpec } from './props';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export type ResourceCreateContextValue = {
	commands: ResourceDetailStandardActionCommands,
	titleLvl1?: SchemaFieldSpec,
	backLinkTitle?: LinkSpec,
	/** The create form's body. See `createNodes` in `props.ts`. */
	createNodes?: ComponentNode[],
	onSubmit: (data: Record<string, any>) => void,
	isSubmitting: boolean,
};

export const ResourceCreateContext = React.createContext<ResourceCreateContextValue | undefined>(undefined);

export function useResourceCreateContext(): ResourceCreateContextValue {
	const value = React.useContext(ResourceCreateContext);
	if (value === undefined) {
		throw new Error('useResourceCreateContext must be used within ResourceCreate');
	}
	return value;
}
