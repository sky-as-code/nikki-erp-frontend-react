import React from 'react';

import { useValueFormatDefaults } from './useValueFormatDefaults';
import { currencyMarkerOf } from '../Localized/formatDefaults';
import { formatLocalizedMoney, formatLocalizedNumber } from '../Localized/localizedFormat';

import type { RawValue } from '../Localized/localizedFormat';


export type FormatterOptions = {
	/** `K` / `M` / `B` abbreviation, the same letters in every language. */
	compact?: boolean,
	/** Exact fraction digits; a number defaults to the digits it carries, money to its currency's. */
	fractionDigits?: number,
};

export type LocalizedFormatters = {
	number: (raw: RawValue, options?: FormatterOptions) => string,
	/** An amount in the system currency: its marker, placement and decimal places. */
	money: (raw: RawValue, options?: FormatterOptions) => string,
};

/**
 * Plain formatting functions bound to the user's format defaults and the system currency, for code
 * that needs a string rather than an element: a chart's tick and tooltip callbacks, an export. A
 * component renders `LocalizedNumber` / `LocalizedMoney` instead.
 */
export function useLocalizedFormatters(): LocalizedFormatters {
	const defaults = useValueFormatDefaults();
	return React.useMemo<LocalizedFormatters>(() => {
		const separators = {
			decimalSeparator: defaults.decimalSeparator,
			thousandsSeparator: defaults.thousandsSeparator,
			grouping: defaults.grouping,
		};
		return {
			number: (raw, options) => formatLocalizedNumber(raw, defaults.locale, { ...separators, ...options }),
			money: (raw, options) => formatLocalizedMoney(raw, defaults.locale, currencyMarkerOf(defaults.currency) ?? '', {
				...separators,
				fractionDigits: options?.fractionDigits ?? defaults.currency?.decimalPlaces,
				symbolPosition: defaults.currency?.symbolPosition,
				compact: options?.compact,
			}),
		};
	}, [defaults]);
}
