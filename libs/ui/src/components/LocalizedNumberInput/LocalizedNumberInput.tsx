import { NumberInput } from '@mantine/core';
import React from 'react';

import { withInputDensity } from '../Input/inputDensity';
import { useFormatDefaults, useFormatLocale } from '../Localized/formatDefaults';
import { resolveNumberSeparators } from '../Localized/localizedFormat';

import type { NumberSeparators } from '../Localized/localizedFormat';
import type { NumberInputProps } from '@mantine/core';


export type LocalizedNumberInputProps = Omit<NumberInputProps, 'thousandSeparator' | 'decimalSeparator'> & {
	/** BCP 47 tag; defaults to the user's language record, then the active UI language. */
	locale?: string,
	/** Groups thousands; `false` for values that are identifiers or years rather than amounts. */
	grouped?: boolean,
	ref?: React.Ref<HTMLInputElement>,
};

/** Keys that type the decimal point: the locale's, and `.`/`,` unless that is the thousands glyph. */
function decimalKeysOf(separators: NumberSeparators, grouped: boolean): string[] {
	const candidates = new Set([separators.decimal, '.', ',']);
	return [...candidates].filter(key => key === separators.decimal || !grouped || key !== separators.thousands);
}

/**
 * Mantine's `NumberInput` typing and showing the user's locale separators, at the app's standard
 * density (see `Input`). The value is a plain number or numeric string with `.` as the decimal
 * point whatever the locale: `valueIsNumericString` keeps a string value — how decimals travel —
 * from being read as already formatted, which in `vi-VN` would turn `1.5` into `15`.
 */
export function LocalizedNumberInput({
	locale, grouped = true, size, classNames, ...props
}: LocalizedNumberInputProps): React.ReactElement {
	const defaults = useFormatDefaults();
	const separators = resolveNumberSeparators(useFormatLocale(locale), defaults);
	return (
		<NumberInput
			size={size ?? 'sm'}
			classNames={size ? classNames : withInputDensity(classNames)}
			thousandSeparator={grouped ? separators.thousands : undefined}
			decimalSeparator={separators.decimal}
			allowedDecimalSeparators={decimalKeysOf(separators, grouped)}
			valueIsNumericString
			{...props}
		/>
	);
}
