import React from 'react';

import { useI18n } from '../../i18n';


/**
 * The formatting rules a session runs on: the acting user's language record and their
 * organization's currency, both as the user-context endpoint reports them.
 *
 * The shape is declared here rather than imported from the shell because this library sits below
 * it — the shell fills the provider in, and a page that renders one of these components outside a
 * shell still formats correctly on `Intl` defaults.
 */
export type FormatDefaults = {
	/** BCP 47 tag of the acting user's language, e.g. `en-US`. */
	locale?: string,
	/**
	 * Separators from the language record. They are supplied only when they disagree with what
	 * `Intl` produces for `locale`: for the languages shipped today the two agree, so this is the
	 * seam for a tenant who customizes their language record rather than a routine override.
	 */
	decimalSeparator?: string,
	thousandsSeparator?: string,
	currency?: {
		code: string,
		symbol: string,
		decimalPlaces: number,
	},
};

const FormatDefaultsContext = React.createContext<FormatDefaults>({});

export function FormatDefaultsProvider({ value, children }: {
	value: FormatDefaults,
	children: React.ReactNode,
}) {
	return <FormatDefaultsContext.Provider value={value}>{children}</FormatDefaultsContext.Provider>;
}

export function useFormatDefaults(): FormatDefaults {
	return React.useContext(FormatDefaultsContext);
}

/**
 * The locale every `Localized*` component formats in: an explicit prop, else the user's language
 * record, else the UI language.
 *
 * The UI language is the last resort rather than the first because the two can legitimately differ
 * — a user reading the interface in English may still want their own number and date conventions.
 */
export function useFormatLocale(explicit?: string): string {
	const defaults = useFormatDefaults();
	const i18n = useI18n();
	return explicit ?? defaults.locale ?? i18n.language;
}

/**
 * What to print as a currency marker.
 *
 * Falls back to the code because the currency catalogue seeds no symbols — a wrong symbol on money
 * is worse than none — so an amount would otherwise render bare.
 */
export function currencyMarkerOf(currency: FormatDefaults['currency']): string | undefined {
	if (!currency) {
		return undefined;
	}
	return currency.symbol || currency.code;
}
