import React from 'react';

import type { SymbolPosition } from './localizedFormat';
import type { DigitGrouping } from './numberGrouping';
import type { WeekDayIndex } from './strftime';


/**
 * The formatting rules a session runs on: the acting user's language record and their
 * organization's currency, both as the user-context endpoint reports them.
 *
 * The shape is declared here rather than imported from the shell because this library sits below
 * it — the shell fills the provider in (`toFormatDefaults`), a micro-app's root reads the same over the
 * bus (`useValueFormatDefaults`), and a page rendered outside a shell still formats on `Intl` defaults.
 */
export type FormatDefaults = {
	/** BCP 47 tag of the acting user's language, e.g. `en-US`. */
	locale?: string,
	/**
	 * Separators from the language record, overriding `Intl`'s for `locale`. An empty thousands
	 * separator is a choice (no glyph between groups), not a missing value.
	 */
	decimalSeparator?: string,
	thousandsSeparator?: string,
	/** The record's digit grouping, parsed (`[3,0]`); see `DigitGrouping`. */
	grouping?: DigitGrouping,
	/** strftime patterns of the record: `%m/%d/%Y`, `%H:%M:%S`, `%H:%M`. */
	dateFormat?: string,
	timeFormat?: string,
	shortTimeFormat?: string,
	/** The record's first day of the week as a date picker takes it, 0 = Sunday. */
	firstDayOfWeek?: WeekDayIndex,
	currency?: {
		code: string,
		symbol: string,
		decimalPlaces: number,
		/** The currency's placement of its symbol; absent leaves it to the locale. */
		symbolPosition?: SymbolPosition,
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
