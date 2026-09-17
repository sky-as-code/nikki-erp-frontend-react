/** Glyph shown for an unset or unparsable value, matching the read-only field renderer. */
export const EMPTY_VALUE = '—';

export type RawValue = string | number | null | undefined;

export type LocalizedNumberOptions = {
	/** Exact number of fraction digits; defaults to the digits present in the raw value. */
	fractionDigits?: number,
	/**
	 * Separators from the organization's language record, overriding what `Intl` produces for the
	 * locale. Supplied only when the two disagree — a tenant who customized their language record —
	 * so grouping itself stays `Intl`'s job and only the glyphs are swapped.
	 */
	decimalSeparator?: string,
	thousandsSeparator?: string,
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

export function formatLocalizedNumber(raw: RawValue, locale: string, opts?: LocalizedNumberOptions): string {
	const value = parseRawNumber(raw);
	if (value === null) {
		return EMPTY_VALUE;
	}
	const digits = resolveFractionDigits(raw, opts);
	const parts = new Intl.NumberFormat(locale, {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	}).formatToParts(value);
	return applySeparators(parts, opts);
}

/**
 * Formats a money amount with the locale's grouping, decimal separator and symbol placement.
 * The placement (prefix in en-US, suffix in vi-VN) comes from `Intl` itself: the amount is
 * formatted as a currency and the currency token is swapped for the caller's symbol, so no
 * per-locale table is needed and negative amounts keep the locale's sign position.
 */
export function formatLocalizedMoney(
	raw: RawValue, locale: string, currencySymbol: string, opts?: LocalizedNumberOptions,
): string {
	const value = parseRawNumber(raw);
	if (value === null) {
		return EMPTY_VALUE;
	}
	const digits = resolveFractionDigits(raw, opts);
	const parts = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'USD',
		currencyDisplay: 'symbol',
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	}).formatToParts(value);
	return applySeparators(
		parts.map((part) => (part.type === 'currency' ? { ...part, value: currencySymbol } : part)),
		opts,
	);
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

function formatDateOnly(raw: string, locale: string): string {
	const date = parseDateOnly(raw);
	return date ? new Intl.DateTimeFormat(locale, DATE_PARTS).format(date) : EMPTY_VALUE;
}

function formatTimeOnly(raw: string, locale: string): string {
	const parsed = parseTimeOnly(raw);
	if (!parsed) {
		return EMPTY_VALUE;
	}
	const options = parsed.hasSeconds ? { ...TIME_PARTS, second: '2-digit' as const } : TIME_PARTS;
	return new Intl.DateTimeFormat(locale, options).format(parsed.date);
}

function formatDateTime(raw: string, locale: string): string {
	if (DATE_ONLY.test(raw)) {
		return formatDateOnly(raw, locale);
	}
	const date = new Date(raw);
	if (Number.isNaN(date.getTime())) {
		return EMPTY_VALUE;
	}
	return new Intl.DateTimeFormat(locale, { ...DATE_PARTS, ...TIME_PARTS }).format(date);
}

export function formatLocalizedDateTime(raw: RawValue, locale: string, kind?: DateTimeKind): string {
	const text = raw === null || raw === undefined ? '' : String(raw).trim();
	if (text === '') {
		return EMPTY_VALUE;
	}
	switch (kind ?? inferDateTimeKind(text)) {
		case 'date':
			return formatDateOnly(text, locale);
		case 'time':
			return formatTimeOnly(text, locale);
		default:
			return formatDateTime(text, locale);
	}
}
