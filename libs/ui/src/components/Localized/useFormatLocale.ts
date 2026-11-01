import { useValueFormatDefaults } from '../valueRenderers/useValueFormatDefaults';


/**
 * The locale every `Localized*` component formats in: an explicit prop, else the user's language
 * record, else the UI language.
 *
 * The UI language is the last resort rather than the first because the two can legitimately differ
 * — a user reading the interface in English may still want their own number and date conventions.
 */
export function useFormatLocale(explicit?: string): string {
	const defaults = useValueFormatDefaults();
	return explicit ?? defaults.locale;
}
