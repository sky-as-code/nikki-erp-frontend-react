import React from 'react';

import { currencyMarkerOf } from './formatDefaults';
import { formatLocalizedMoney } from './localizedFormat';
import { useValueFormatDefaults } from '../valueRenderers/useValueFormatDefaults';

import type { SymbolPosition } from './localizedFormat';
import type { LocalizedNumberProps } from './LocalizedNumber';


export type LocalizedMoneyProps = LocalizedNumberProps & {
	/**
	 * Symbol placed where the locale puts its currency (prefix in en-US, suffix in vi-VN).
	 *
	 * Optional: the organization's own currency answers this, and a page only names one to override
	 * it for a column denominated in something else. An amount with no currency resolvable at all
	 * still renders — as a plain number, which is better than one marked in the wrong currency.
	 */
	currencySymbol?: string,
	/** Where the symbol goes; defaults to the user's currency's own placement, then the locale's. */
	symbolPosition?: SymbolPosition,
};

/**
 * Renders a money amount: same number formatting as {@link LocalizedNumber}, plus the symbol at
 * the locale's position. Both share `formatLocalizedNumber`'s parsing and fraction-digit rules.
 */
export function LocalizedMoney({
	value, locale, fractionDigits, decimalSeparator, thousandsSeparator, grouping, currencySymbol, symbolPosition,
	className,
}: LocalizedMoneyProps) {
	const defaults = useValueFormatDefaults();
	const marker = currencySymbol ?? currencyMarkerOf(defaults.currency) ?? '';
	const text = formatLocalizedMoney(value, locale ?? defaults.locale, marker, {
		fractionDigits: fractionDigits ?? defaults.currency?.decimalPlaces,
		decimalSeparator: decimalSeparator ?? defaults.decimalSeparator,
		thousandsSeparator: thousandsSeparator ?? defaults.thousandsSeparator,
		grouping: grouping ?? defaults.grouping,
		symbolPosition: symbolPosition ?? defaults.currency?.symbolPosition,
	});
	return <span className={className}>{text}</span>;
}
