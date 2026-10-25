import { useEffect, useState } from 'react';

import { loadEnabledLanguagesOnce, type EnabledLanguage, type EnabledLanguages } from './languageService';
import { useAccountSettings } from '../userContext/userContextSelectors';


function useLoadedLanguages(): EnabledLanguages | null {
	const [loaded, setLoaded] = useState<EnabledLanguages | null>(null);
	useEffect(() => {
		let active = true;
		void loadEnabledLanguagesOnce().then(next => {
			if (active && next) setLoaded(next);
		});
		return () => {
			active = false;
		};
	}, []);
	return loaded;
}

/**
 * The languages a user may pick, by display name.
 *
 * Until the list arrives, and if it cannot be read, it falls back to the user context's
 * `supported_languages`, labelled by code: a picker with codes is worse than one with names, but
 * better than an empty one. On the sign-in page there is no user context, so it is empty until
 * the public list arrives.
 */
export function useEnabledLanguages(): EnabledLanguage[] {
	const supported: string[] | undefined = useAccountSettings()?.supportedLanguages;
	const loaded = useLoadedLanguages();
	return loaded?.languages ?? (supported ?? []).map(code => ({ isoCode: code, name: code }));
}

/** The system default language -- what applies when neither a user nor their organization chose. */
export function useDefaultLanguage(): string | null {
	return useLoadedLanguages()?.defaultIsoCode ?? null;
}
