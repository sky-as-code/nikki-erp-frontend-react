import React from 'react';

import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * What a `resourceGenericPage` supplies to the nodes below it.
 *
 * Deliberately smaller than the resource-detail contexts: there is no record, no form runtime and
 * no command set here, because a generic page owns its own behaviour. Everything the header needs
 * to render is either in this value or in its own props.
 */
export type ResourceGenericPageContextValue = {
	translationNs: string,
	schemaPack: dyn.SchemaPack | null,
	titleParams?: Record<string, string>,
	testId?: string,
};

const ResourceGenericPageContext = React.createContext<ResourceGenericPageContextValue | null>(null);

export function ResourceGenericPageProvider({ value, children }: {
	value: ResourceGenericPageContextValue,
	children: React.ReactNode,
}): React.ReactNode {
	return (
		<ResourceGenericPageContext.Provider value={value}>
			{children}
		</ResourceGenericPageContext.Provider>
	);
}

/**
 * Non-throwing, like `usePageHeader`: a node rendered outside the template should degrade to its
 * static parts rather than blank the route through an error boundary.
 */
export function useResourceGenericPageContext(): ResourceGenericPageContextValue | null {
	return React.useContext(ResourceGenericPageContext);
}
