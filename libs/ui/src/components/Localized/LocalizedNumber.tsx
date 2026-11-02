import React from 'react';

import { formatLocalizedNumber } from './localizedFormat';
import { useValueFormatDefaults } from '../valueRenderers/useValueFormatDefaults';

import type { LocalizedNumberOptions, RawValue } from './localizedFormat';


export type LocalizedNumberProps = LocalizedNumberOptions & {
	/** Raw value as the API sends it (decimals travel as strings end to end). */
	value: RawValue,
	/** BCP 47 tag; defaults to the user's language record, then the active UI language. */
	locale?: string,
	className?: string,
};

/** Renders a number with the language record's grouping and separators, else the locale's. */
export function LocalizedNumber({
	value, locale, fractionDigits, decimalSeparator, thousandsSeparator, grouping, compact, className,
}: LocalizedNumberProps) {
	const defaults = useValueFormatDefaults();
	const text = formatLocalizedNumber(value, locale ?? defaults.locale, {
		fractionDigits,
		decimalSeparator: decimalSeparator ?? defaults.decimalSeparator,
		thousandsSeparator: thousandsSeparator ?? defaults.thousandsSeparator,
		grouping: grouping ?? defaults.grouping,
		compact,
	});
	return <span className={className}>{text}</span>;
}
