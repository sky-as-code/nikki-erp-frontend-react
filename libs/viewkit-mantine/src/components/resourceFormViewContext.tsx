import React from 'react';


/** Shared edit-mode state for a `resource_form` subtree (action bar <-> columns). */
export type ResourceFormViewContextValue = {
	updateMode: boolean,
	setUpdateMode: React.Dispatch<React.SetStateAction<boolean>>,
};

const ResourceFormViewContext = React.createContext<ResourceFormViewContextValue | null>(null);

export type ResourceFormViewProviderProps = {
	value: ResourceFormViewContextValue,
	children: React.ReactNode,
};

export function ResourceFormViewProvider({ value, children }: ResourceFormViewProviderProps): React.ReactNode {
	return <ResourceFormViewContext.Provider value={value}>{children}</ResourceFormViewContext.Provider>;
}

export function useResourceFormView(): ResourceFormViewContextValue | null {
	return React.useContext(ResourceFormViewContext);
}
