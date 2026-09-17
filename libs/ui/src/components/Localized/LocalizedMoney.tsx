import React from 'react';

import { currencyMarkerOf, useFormatDefaults, useFormatLocale } from './formatDefaults';
import { formatLocalizedMoney } from './localizedFormat';

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
};

/**
 * Renders a money amount: same number formatting as {@link LocalizedNumber}, plus the symbol at
 * the locale's position. Both share `formatLocalizedNumber`'s parsing and fraction-digit rules.
 */
export function LocalizedMoney({
	value, locale, fractionDigits, decimalSeparator, thousandsSeparator, currencySymbol, className,
}: LocalizedMoneyProps) {
	const defaults = useFormatDefaults();
	const marker = currencySymbol ?? currencyMarkerOf(defaults.currency) ?? '';
	const text = formatLocalizedMoney(value, useFormatLocale(locale), marker, {
		fractionDigits: fractionDigits ?? defaults.currency?.decimalPlaces,
		decimalSeparator: decimalSeparator ?? defaults.decimalSeparator,
		thousandsSeparator: thousandsSeparator ?? defaults.thousandsSeparator,
	});
	return <span className={className}>{text}</span>;
}
