import * as dyn from '@nikkierp/common/dynamic_model';
import React from 'react';


export type ResourceDetailContextValue = {
	translationNs: string,
	schemaPack: dyn.SchemaPack | null,
	isReading: boolean,
	isWriting: boolean,
};

const ResourceDetailContext = React.createContext<ResourceDetailContextValue | undefined>(undefined);

export type ResourceDetailProviderProps = ResourceDetailContextValue & {
	children: React.ReactNode,
};

export function ResourceDetailProvider({
	translationNs, schemaPack, isReading, isWriting, children,
}: ResourceDetailProviderProps): React.ReactNode {
	const value = React.useMemo(
		(): ResourceDetailContextValue => ({
			translationNs,
			schemaPack,
			isReading,
			isWriting,
		}),
		[translationNs, schemaPack, isReading, isWriting],
	);

	return (
		<ResourceDetailContext.Provider value={value}>
			{children}
		</ResourceDetailContext.Provider>
	);
}

export function useResourceDetailContext(): ResourceDetailContextValue {
	const value = React.useContext(ResourceDetailContext);
	if (value === undefined) {
		throw new Error('useResourceDetailContext must be used within ResourceDetailProvider');
	}
	return value;
}

export function useResourceDetailTranslationNs(): string {
	return useResourceDetailContext().translationNs;
}
