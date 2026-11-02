import { Badge } from '@mantine/core';
import React from 'react';

import { useValueFormatDefaults } from './useValueFormatDefaults';
import { formatLocalizedMoney, formatLocalizedNumber, parseRawNumber } from '../Localized/localizedFormat';

import type { FormatDefaults } from '../Localized/formatDefaults';
import type { SymbolPosition } from '../Localized/localizedFormat';
import type { RawValue } from '../Localized/localizedFormat';


/** What every value renderer prints for an unset or unparsable value. */
export const EMPTY_RENDERED_VALUE = '-';

export const DEFAULT_FLOAT_PRECISION = 2;

export type IntegerRendererProps = {
	rawValue: RawValue,
	/** `K` / `M` / `B` abbreviation; see `LocalizedNumberOptions.compact`. */
	compact?: boolean,
};

export type FloatRendererProps = {
	rawValue: RawValue,
	precision?: number,
	/** Marks the number as money, placed where the locale puts its currency. */
	currencySymbol?: string,
	/** Overrides the locale's placement of `currencySymbol`. */
	symbolPosition?: SymbolPosition,
	/** `K` / `M` / `B` abbreviation; see `LocalizedNumberOptions.compact`. */
	compact?: boolean,
};

export type MoneyCurrency = {
	code: string,
	symbol?: string,
	/** Omitted, taken from the user's default currency when the codes match, else the system default. */
	decimalPlaces?: number,
	/** Omitted, taken from the user's default currency when the codes match, else the locale's. */
	symbolPosition?: SymbolPosition,
};

export type MoneyRendererProps = { rawValue: RawValue, currency?: MoneyCurrency, compact?: boolean };

export type EnumRendererProps = {
	rawValue: RawValue,
	colorMap?: Record<string, string>,
	/** The translated value; defaults to the raw value. */
	label?: React.ReactNode,
};

export function IntegerRenderer({ rawValue, compact }: IntegerRendererProps) {
	return <FloatRenderer rawValue={rawValue} precision={0} compact={compact} />;
}

export function FloatRenderer(
	{ rawValue, precision = DEFAULT_FLOAT_PRECISION, currencySymbol, symbolPosition, compact }: FloatRendererProps,
) {
	const defaults = useValueFormatDefaults();
	if (parseRawNumber(rawValue) === null) {
		return <span>{EMPTY_RENDERED_VALUE}</span>;
	}
	const options = {
		fractionDigits: precision,
		decimalSeparator: defaults.decimalSeparator,
		thousandsSeparator: defaults.thousandsSeparator,
		grouping: defaults.grouping,
		compact,
	};
	const text = currencySymbol
		? formatLocalizedMoney(rawValue, defaults.locale, currencySymbol, { ...options, symbolPosition })
		: formatLocalizedNumber(rawValue, defaults.locale, options);
	return <span>{text}</span>;
}

/**
 * A money amount: a {@link FloatRenderer} whose precision and marker come from the currency. The
 * marker falls back to the code because the currency catalogue seeds no symbols.
 */
export function MoneyRenderer({ rawValue, currency, compact }: MoneyRendererProps) {
	const defaults = useValueFormatDefaults();
	const resolved = resolveMoneyCurrency(currency, defaults.currency);
	return (
		<FloatRenderer
			rawValue={rawValue}
			precision={resolved?.decimalPlaces ?? DEFAULT_FLOAT_PRECISION}
			currencySymbol={resolved ? resolved.symbol || resolved.code : undefined}
			symbolPosition={resolved?.symbolPosition}
			compact={compact}
		/>
	);
}

/**
 * Fills what the given currency leaves out from the user's default currency when both name the
 * same code; with no currency given, the default currency answers alone.
 */
export function resolveMoneyCurrency(
	currency: MoneyCurrency | undefined, fallback: FormatDefaults['currency'],
): MoneyCurrency | undefined {
	if (!currency) {
		return fallback;
	}
	if (fallback && fallback.code === currency.code) {
		return {
			code: currency.code,
			symbol: currency.symbol || fallback.symbol,
			decimalPlaces: currency.decimalPlaces ?? fallback.decimalPlaces,
			symbolPosition: currency.symbolPosition ?? fallback.symbolPosition,
		};
	}
	return currency;
}

export function EnumRenderer({ rawValue, colorMap, label }: EnumRendererProps) {
	const value = rawValue === null || rawValue === undefined ? '' : String(rawValue);
	if (value === '') {
		return <span>{EMPTY_RENDERED_VALUE}</span>;
	}
	return <Badge variant='filled' color={colorMap?.[value] ?? 'gray'}>{label ?? value}</Badge>;
}
