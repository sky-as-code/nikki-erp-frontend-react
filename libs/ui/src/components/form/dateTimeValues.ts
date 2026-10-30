/**
 * Wire formats of the backend's date types (`nikkierp/common/model/types.go`): `nikkiDateTime` is
 * RFC3339 in UTC ending in `Z` (`ParseModelDateTime` refuses anything else), `nikkiDate` is
 * `YYYY-MM-DD` and `nikkiTime` is `HH:mm:ss`, both wall-clock values with no zone. The zod schemas in
 * `@nikkierp/common/dynamicModel` check the same shapes. Mantine's pickers speak their own local
 * strings, so every date input converts at its `onChange`.
 */

const PICKER_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/;
const PLAIN_DATE = /^\d{4}-\d{2}-\d{2}/;
const PLAIN_TIME = /^(\d{2}):(\d{2})(?::(\d{2}))?/;

/**
 * Mantine 9's `DateTimePicker` value (`'YYYY-MM-DD HH:mm:ss'`, the user's local wall clock) → RFC3339 UTC.
 * Parsed field by field as **local** time: `new Date('2026-01-02 10:00')` is implementation-defined.
 */
export function pickerDateTimeToIso(value: string | Date | null | undefined): string | undefined {
	if (value instanceof Date) return isoSeconds(value);
	const match = value ? PICKER_DATE_TIME.exec(value.trim()) : null;
	if (!match) return value ? value : undefined;
	const [year, month, day, hour, minute, second] = match.slice(1).map((part) => Number(part ?? 0));
	return isoSeconds(new Date(year, month - 1, day, hour, minute, second));
}

/** A stored `nikkiDate` → what `DateInput` shows: the date string itself, never a UTC-midnight `Date`. */
export function storedDateToPicker(value: unknown): string | Date | null {
	if (value instanceof Date) return value;
	if (typeof value === 'string' && PLAIN_DATE.test(value)) return value.slice(0, 10);
	return null;
}

/** A native time input's `HH:mm` (or `HH:mm:ss`) → `nikkiTime`'s `HH:mm:ss`. */
export function inputTimeToModel(value: string | null | undefined): string | undefined {
	const match = value ? PLAIN_TIME.exec(value) : null;
	if (!match) return value ? value : undefined;
	return `${match[1]}:${match[2]}:${match[3] ?? '00'}`;
}

/** A stored `nikkiTime` → a native time input's value; seconds only when the input shows them. */
export function storedTimeToInput(value: unknown, withSeconds: boolean): string {
	if (typeof value !== 'string' || !value) return '';
	const match = PLAIN_TIME.exec(value);
	if (!match) return value;
	return withSeconds ? `${match[1]}:${match[2]}:${match[3] ?? '00'}` : `${match[1]}:${match[2]}`;
}

function isoSeconds(date: Date): string | undefined {
	if (Number.isNaN(date.getTime())) return undefined;
	return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}
