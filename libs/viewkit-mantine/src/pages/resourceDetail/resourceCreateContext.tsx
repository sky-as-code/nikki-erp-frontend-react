import React from 'react';

import type {
	LinkSpec, OwnPropertySection, ResourceDetailStandardActionCommands, SchemaFieldSpec,
} from './props';


export type ResourceCreateContextValue = {
	commands: ResourceDetailStandardActionCommands,
	titleLvl1?: SchemaFieldSpec,
	titleLvl3?: LinkSpec,
	blocks: OwnPropertySection[],
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
