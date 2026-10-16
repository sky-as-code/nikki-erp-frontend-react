import i18n from '@nikkierp/ui/i18n';
import { useEffect, useRef, useState } from 'react';

import { shellEventBus } from '../eventBus';
import { LOCAL_SETTINGS_CHANGED_EVENT, useAccountSettings, useLocalSettings } from '../userContext';


/**
 * Applies the user's stored language to i18n, the counterpart of `ApplyStoredTheme`.
 *
 * `initI18n` picks the language once at boot. After that a language changes only by writing the
 * Shell's local settings -- the language dialog, a Settings save, a refreshed user context -- and
 * this is what makes the interface follow, so no caller has to reach i18n itself.
 *
 * It reacts to changes, not to every render, for the same cross-tab reason `ApplyStoredTheme`
 * spells out. A code the user context does not list as supported is ignored: switching to it
 * would render every key as its raw namespace:key.
 */
export function ApplyStoredLanguage(): null {
	const storedLanguage = useLocalSettings()?.languageCode ?? null;
	const supported: string[] | undefined = useAccountSettings()?.supportedLanguages;
	// Bumped by the event to re-run the effect when the store write happened in another React tree.
	const [signal, setSignal] = useState(0);
	const appliedLanguage = useRef<string | null>(null);

	useEffect(() => {
		return shellEventBus.subscribe(LOCAL_SETTINGS_CHANGED_EVENT, () => setSignal(n => n + 1));
	}, []);

	useEffect(() => {
		if (!storedLanguage || appliedLanguage.current === storedLanguage) return;
		if (supported && !supported.includes(storedLanguage)) return;
		appliedLanguage.current = storedLanguage;
		if (i18n.language !== storedLanguage) {
			void i18n.changeLanguage(storedLanguage);
		}
	}, [storedLanguage, supported, signal]);

	return null;
}
