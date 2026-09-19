import React from 'react';

import { useFormatDefaults, useFormatLocale } from './formatDefaults';
import { formatLocalizedNumber } from './localizedFormat';

import type { LocalizedNumberOptions, RawValue } from './localizedFormat';


export type LocalizedNumberProps = LocalizedNumberOptions & {
	/** Raw value as the API sends it (decimals travel as strings end to end). */
	value: RawValue,
	/** BCP 47 tag; defaults to the user's language record, then the active UI language. */
	locale?: string,
	className?: string,
};

/** Renders a number with the locale's grouping and decimal separators. */
export function LocalizedNumber({
	value, locale, fractionDigits, decimalSeparator, thousandsSeparator, className,
}: LocalizedNumberProps) {
	const defaults = useFormatDefaults();
	const text = formatLocalizedNumber(value, useFormatLocale(locale), {
		fractionDigits,
		decimalSeparator: decimalSeparator ?? defaults.decimalSeparator,
		thousandsSeparator: thousandsSeparator ?? defaults.thousandsSeparator,
	});
	return <span className={className}>{text}</span>;
}
