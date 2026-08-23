import React from 'react';

import type { SettingLevel } from './props';


/**
 * What a settings item needs from the section that encloses it.
 *
 * The namespace is declared once on the section rather than repeated on every item, the same way
 * a resource page declares `translationNs` once on its template.
 */
export type SettingsSectionContextValue = {
	translationNs: string,
	/**
	 * The level every item in this section belongs to.
	 *
	 * Inherited rather than repeated per item: a section *is* a level, so letting an item name a
	 * different one would let a "User settings" block contain an organization setting, which is
	 * exactly the confusion the visible separation exists to prevent.
	 */
	level: SettingLevel,
};

const SettingsSectionContext = React.createContext<SettingsSectionContextValue | null>(null);

export const SettingsSectionProvider = SettingsSectionContext.Provider;

/**
 * Returns the enclosing section, or throws.
 *
 * A settings item outside a section has no namespace to resolve its label against, so it would
 * render every key as raw `namespace:key` text -- a failure that looks like a missing translation
 * rather than a malformed page. Failing here names the real cause.
 */
export function useSettingsSectionContext(): SettingsSectionContextValue {
	const context = React.useContext(SettingsSectionContext);
	if (!context) {
		throw new Error('A settings item must be rendered inside a settings section');
	}
	return context;
}

/**
 * The description key a setting falls back to when its node does not name one.
 *
 * The backend declares each setting's description as a `$ref` keyed `settings_desc.<name>`, so
 * following the same convention here means a module that adds a setting gets its explanatory
 * sentence without restating the key on the frontend.
 */
export function defaultSettingDescriptionKey(name: string): string {
	return `settings_desc.${name}`;
}

export type { SettingLevel };
