import React from 'react';

import type { SettingsPageProps } from '../props';


/**
 * Everything the settings page's components need, in one place.
 *
 * They read it instead of taking props because behaviour cannot survive `JSON.stringify`: a page
 * node can say *that* the rail belongs here, never what clicking an entry does. Page JSON
 * carries placement; this context carries state and callbacks.
 */
export type SettingsPageContextValue = {
	/** The validated page params, for the panes and namespace the components need. */
	params: SettingsPageProps,
	/** Slug of the pane currently rendered on the right, or null when there are none. */
	activeSlug: string | null,
	setActiveSlug: (slug: string) => void,
};

const SettingsPageContext = React.createContext<SettingsPageContextValue | undefined>(undefined);

export type SettingsPageContextProviderProps = {
	value: SettingsPageContextValue,
	children: React.ReactNode,
};

export function SettingsPageContextProvider({
	value, children,
}: SettingsPageContextProviderProps): React.ReactNode {
	return <SettingsPageContext.Provider value={value}>{children}</SettingsPageContext.Provider>;
}

export function useSettingsPageContext(): SettingsPageContextValue {
	const value = React.useContext(SettingsPageContext);
	if (value === undefined) {
		throw new Error('useSettingsPageContext must be used within SettingsPage');
	}
	return value;
}
