import { groupDigits } from './numberGrouping';
import { formatStrftime } from './strftime';

import type { DigitGrouping } from './numberGrouping';


/** Glyph shown for an unset or unparsable value, matching the read-only field renderer. */
export const EMPTY_VALUE = '—';

export type RawValue = string | number | null | undefined;

export type LocalizedNumberOptions = {
	/** Exact number of fraction digits; defaults to the digits present in the raw value. */
	fractionDigits?: number,
	/**
	 * Separators from the user's language record, overriding what `Intl` produces for the locale.
	 * Without `grouping` only the glyphs are swapped and the group positions stay `Intl`'s.
	 */
	decimalSeparator?: string,
	thousandsSeparator?: string,
	/**
	 * The language record's digit grouping (`[3,2,-1]`). `Intl` cannot express it, so when it is set
	 * the integer digits are grouped here instead, with `thousandsSeparator` or the locale's glyph.
	 */
	grouping?: DigitGrouping,
	/**
	 * Abbreviates large amounts with `K` (thousand), `M` (million) or `B` (billion), the same letters
	 * in every language, keeping at most one fraction digit: `1.5M`, `1,5M ₫`, `$2.3K`. Smaller
	 * amounts print as usual.
	 */
	compact?: boolean,
};

/** strftime patterns from the user's language record (`%d/%m/%Y`, `%H:%M:%S`, `%H:%M`). */
export type DateTimePatterns = {
	dateFormat?: string,
	timeFormat?: string,
	shortTimeFormat?: string,
};

export type DateTimeKind = 'date' | 'time' | 'datetime';

const MAX_FRACTION_DIGITS = 20;
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_ONLY = /^(\d{2}):(\d{2})(?::(\d{2}))?/;

export function parseRawNumber(raw: RawValue): number | null {
	if (raw === null || raw === undefined) {
		return null;
	}
	const text = String(raw).trim();
	if (text === '') {
		return null;
	}
	const parsed = Number(text);
	return Number.isFinite(parsed) ? parsed : null;
}

/** Fraction digits carried by the raw string, so "12.50" keeps its two decimals. */
function countRawFractionDigits(raw: RawValue): number {
	const text = String(raw ?? '').trim().toLowerCase();
	if (text.includes('e')) {
		return 0;
	}
	const dot = text.indexOf('.');
	return dot < 0 ? 0 : Math.min(text.length - dot - 1, MAX_FRACTION_DIGITS);
}

function resolveFractionDigits(raw: RawValue, opts?: LocalizedNumberOptions): number {
	const digits = opts?.fractionDigits ?? countRawFractionDigits(raw);
	return Math.max(0, Math.min(digits, MAX_FRACTION_DIGITS));
}

/** Swaps Intl's separator glyphs for the language record's, leaving grouping positions alone. */
function applySeparators(parts: Intl.NumberFormatPart[], opts?: LocalizedNumberOptions): string {
	return parts.map((part) => {
		if (part.type === 'group' && opts?.thousandsSeparator !== undefined) {
			return opts.thousandsSeparator;
		}
		if (part.type === 'decimal' && opts?.decimalSeparator !== undefined) {
			return opts.decimalSeparator;
		}
		return part.value;
	}).join('');
}

export type NumberSeparators = { decimal: string, thousands: string };

/** The separators a number input types and shows: the language record's where it sets them, else `Intl`'s. */
export function resolveNumberSeparators(locale: string, opts?: LocalizedNumberOptions): NumberSeparators {
	const parts = new Intl.NumberFormat(locale).formatToParts(1234567.5);
	return {
		decimal: opts?.decimalSeparator ?? parts.find(part => part.type === 'decimal')?.value ?? '.',
		thousands: opts?.thousandsSeparator ?? parts.find(part => part.type === 'group')?.value ?? ',',
	};
}

/**
 * `Intl`'s parts for `value`; with a record `grouping`, ungrouped by `Intl` and regrouped here, since
 * `Intl` only knows its locale's own positions.
 */
function formatNumberParts(
	value: number, locale: string, options: Intl.NumberFormatOptions, opts?: LocalizedNumberOptions,
): Intl.NumberFormatPart[] {
	const grouping = opts?.grouping;
	const parts = new Intl.NumberFormat(locale, { ...options, useGrouping: !grouping }).formatToParts(value);
	if (!grouping) {
		return parts;
	}
	const glyph = opts?.thousandsSeparator ?? resolveNumberSeparators(locale).thousands;
	return parts.map((part) => (
		part.type === 'integer' ? { ...part, value: groupDigits(part.value, grouping, glyph) } : part
	));
}

export function formatLocalizedNumber(raw: RawValue, locale: string, opts?: LocalizedNumberOptions): string {
	const value = parseRawNumber(raw);
	if (value === null) {
		return EMPTY_VALUE;
	}
	const digits = resolveFractionDigits(raw, opts);
	if (opts?.compact) {
		return `${value < 0 ? '-' : ''}${compactAmount(Math.abs(value), locale, digits, opts)}`;
	}
	const parts = formatNumberParts(value, locale, {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	}, opts);
	return applySeparators(parts, opts);
}

/**
 * Formats a money amount with the locale's grouping, decimal separator and symbol placement.
 * The placement (prefix in en-US, suffix in vi-VN) comes from `Intl` itself: the amount is
 * formatted as a currency and the currency token is swapped for the caller's symbol, so no
 * per-locale table is needed and negative amounts keep the locale's sign position.
 */
/** Where a currency writes its symbol: `$15.00` or `15.000 ₫`. Mirrors the backend's `symbol_position`. */
export type SymbolPosition = 'before' | 'after';

export type MoneyFormatOptions = LocalizedNumberOptions & {
	/** The currency's own placement; without it the locale decides. */
	symbolPosition?: SymbolPosition,
};

export function formatLocalizedMoney(
	raw: RawValue, locale: string, currencySymbol: string, opts?: MoneyFormatOptions,
): string {
	const value = parseRawNumber(raw);
	if (value === null) {
		return EMPTY_VALUE;
	}
	const digits = resolveFractionDigits(raw, opts);
	if (opts?.compact) {
		const position = opts.symbolPosition ?? (currencySymbolPosition(locale) === 'prefix' ? 'before' : 'after');
		return placeSymbol(value, compactAmount(Math.abs(value), locale, digits, opts), currencySymbol, position);
	}
	if (opts?.symbolPosition && currencySymbol) {
		const amount = applySeparators(formatNumberParts(Math.abs(value), locale, {
			minimumFractionDigits: digits,
			maximumFractionDigits: digits,
		}, opts), opts);
		return placeSymbol(value, amount, currencySymbol, opts.symbolPosition);
	}
	const parts = formatNumberParts(value, locale, {
		style: 'currency',
		currency: 'USD',
		currencyDisplay: 'symbol',
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	}, opts);
	return applySeparators(
		parts.map((part) => (part.type === 'currency' ? { ...part, value: currencySymbol } : part)),
		opts,
	);
}

const NBSP = '\u00A0';

/**
 * The amount with the symbol where the currency puts it, the sign first: `-$15.00`, `-15.000 ₫`. A
 * symbol made of letters (a bare code such as `VND`) is spaced from the digits on either side.
 */
function placeSymbol(value: number, amount: string, symbol: string, position: SymbolPosition): string {
	const sign = value < 0 ? '-' : '';
	if (!symbol) {
		return `${sign}${amount}`;
	}
	if (position === 'before') {
		const gap = /\p{L}$/u.test(symbol) ? NBSP : '';
		return `${sign}${symbol}${gap}${amount}`;
	}
	return `${sign}${amount}${NBSP}${symbol}`;
}

/** Thresholds of the compact format, largest first; the letters are the same in every language. */
const COMPACT_STEPS: ReadonlyArray<readonly [number, string]> = [[1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
const COMPACT_FRACTION_DIGITS = 1;

/**
 * A non-negative amount abbreviated by the largest step it reaches, one fraction digit at most and
 * trailing zeros dropped (`1.5M`, `2K`). Rounding up to a full step moves to the next one
 * (`999,950` reads `1M`, not `1000K`). Below the smallest step the amount keeps its own digits.
 */
function compactAmount(abs: number, locale: string, digits: number, opts?: LocalizedNumberOptions): string {
	const factor = 10 ** COMPACT_FRACTION_DIGITS;
	const reached = COMPACT_STEPS.findIndex(([threshold]) => abs >= threshold);
	if (reached === -1) {
		return applySeparators(formatNumberParts(abs, locale, {
			minimumFractionDigits: digits,
			maximumFractionDigits: digits,
		}, opts), opts);
	}
	let index = reached;
	let scaled = Math.round((abs / COMPACT_STEPS[index][0]) * factor) / factor;
	if (scaled >= 1000 && index > 0) {
		index -= 1;
		scaled = Math.round((abs / COMPACT_STEPS[index][0]) * factor) / factor;
	}
	return applySeparators(formatNumberParts(scaled, locale, {
		minimumFractionDigits: 0,
		maximumFractionDigits: COMPACT_FRACTION_DIGITS,
	}, opts), opts) + COMPACT_STEPS[index][1];
}

/** Whether the locale writes the currency symbol before or after the amount. */
export function currencySymbolPosition(locale: string): 'prefix' | 'suffix' {
	const parts = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).formatToParts(1);
	const currencyIndex = parts.findIndex((part) => part.type === 'currency');
	const integerIndex = parts.findIndex((part) => part.type === 'integer');
	return currencyIndex < integerIndex ? 'prefix' : 'suffix';
}

export function inferDateTimeKind(raw: string): DateTimeKind {
	if (DATE_ONLY.test(raw)) {
		return 'date';
	}
	if (TIME_ONLY.test(raw) && !raw.includes('-')) {
		return 'time';
	}
	return 'datetime';
}

/** Builds a local Date from a date-only string without a timezone shift, unlike `new Date('YYYY-MM-DD')`. */
function parseDateOnly(raw: string): Date | null {
	const match = DATE_ONLY.exec(raw);
	if (!match) {
		return null;
	}
	const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
	return Number.isNaN(date.getTime()) ? null : date;
}

function parseTimeOnly(raw: string): { date: Date, hasSeconds: boolean } | null {
	const match = TIME_ONLY.exec(raw);
	if (!match) {
		return null;
	}
	const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]), Number(match[3] ?? 0));
	return Number.isNaN(date.getTime()) ? null : { date, hasSeconds: match[3] !== undefined };
}

const DATE_PARTS: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
const TIME_PARTS: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

function formatDateOnly(raw: string, locale: string, patterns?: DateTimePatterns): string {
	const date = parseDateOnly(raw);
	if (!date) {
		return EMPTY_VALUE;
	}
	return formatStrftime(date, patterns?.dateFormat, locale)
		?? new Intl.DateTimeFormat(locale, DATE_PARTS).format(date);
}

function formatTimeOnly(raw: string, locale: string, patterns?: DateTimePatterns): string {
	const parsed = parseTimeOnly(raw);
	if (!parsed) {
		return EMPTY_VALUE;
	}
	const pattern = parsed.hasSeconds ? patterns?.timeFormat : patterns?.shortTimeFormat;
	const custom = formatStrftime(parsed.date, pattern, locale);
	if (custom !== null) {
		return custom;
	}
	const options = parsed.hasSeconds ? { ...TIME_PARTS, second: '2-digit' as const } : TIME_PARTS;
	return new Intl.DateTimeFormat(locale, options).format(parsed.date);
}

/** A timestamp shows as the record's date then short time patterns (no seconds), as Intl's default does. */
function formatDateTime(raw: string, locale: string, patterns?: DateTimePatterns): string {
	if (DATE_ONLY.test(raw)) {
		return formatDateOnly(raw, locale, patterns);
	}
	const date = new Date(raw);
	if (Number.isNaN(date.getTime())) {
		return EMPTY_VALUE;
	}
	const datePart = formatStrftime(date, patterns?.dateFormat, locale);
	const timePart = formatStrftime(date, patterns?.shortTimeFormat, locale);
	if (datePart !== null && timePart !== null) {
		return `${datePart} ${timePart}`;
	}
	return new Intl.DateTimeFormat(locale, { ...DATE_PARTS, ...TIME_PARTS }).format(date);
}

/**
 * Formats a date, time or timestamp: with the language record's strftime `patterns` when given and
 * convertible (see `strftimeToDayjs`), else in the locale's `Intl` order and separators.
 */
export function formatLocalizedDateTime(
	raw: RawValue, locale: string, kind?: DateTimeKind, patterns?: DateTimePatterns,
): string {
	const text = raw === null || raw === undefined ? '' : String(raw).trim();
	if (text === '') {
		return EMPTY_VALUE;
	}
	switch (kind ?? inferDateTimeKind(text)) {
		case 'date':
			return formatDateOnly(text, locale, patterns);
		case 'time':
			return formatTimeOnly(text, locale, patterns);
		default:
			return formatDateTime(text, locale, patterns);
	}
}
