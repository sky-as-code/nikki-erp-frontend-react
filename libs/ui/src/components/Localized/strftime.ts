import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/vi';


// Mantine's date inputs parse typed text with `dayjs(text, valueFormat)`, which ignores the format
// without `customParseFormat`; `localizedFormat` serves `%c`, `%x` and `%X`.
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);

/**
 * strftime directives the language record refuses (Odoo's `_disallowed_datetime_patterns`): they are
 * platform-specific or have no equivalent in the backend's formatter. Mirrors the backend list.
 */
export const STRFTIME_DISALLOWED_DIRECTIVES: readonly string[] = [
	'%C', '%D', '%e', '%E', '%F', '%g', '%G', '%h', '%k', '%l', '%n', '%O', '%P', '%R', '%r', '%s', '%T',
	'%t', '%u', '%V', '%+',
];

/** Every allowed directive the browser can render, with its dayjs token. */
const DAYJS_TOKENS: Readonly<Record<string, string>> = {
	'%a': 'ddd',
	'%A': 'dddd',
	'%b': 'MMM',
	'%B': 'MMMM',
	'%c': 'L LTS',
	'%d': 'DD',
	'%H': 'HH',
	'%I': 'hh',
	'%m': 'MM',
	'%M': 'mm',
	'%p': 'A',
	'%S': 'ss',
	'%w': 'd',
	'%x': 'L',
	'%X': 'LTS',
	'%y': 'YY',
	'%Y': 'YYYY',
	'%z': 'ZZ',
};

/** The directives a format may use and the browser renders, in the order a help list shows them. */
export const STRFTIME_SUPPORTED_DIRECTIVES: readonly string[] = [...Object.keys(DAYJS_TOKENS), '%%'];

const DIRECTIVE = /%(.?)/g;

/** A literal run in dayjs syntax: bracketed only when it holds letters dayjs would read as tokens. */
function escapeLiteral(text: string): string | null {
	if (!/[A-Za-z[\]]/.test(text)) {
		return text;
	}
	return text.includes(']') ? null : `[${text}]`;
}

/**
 * Converts an Odoo strftime pattern (`%d/%m/%Y`) to a dayjs format (`DD/MM/YYYY`).
 *
 * Answers `null` when the pattern uses a disallowed or unknown directive, or one dayjs has no token for
 * (`%j`, `%U`, `%W`, `%Z`): the caller then formats with the locale default rather than print a
 * half-converted pattern.
 */
export function strftimeToDayjs(pattern: string | null | undefined): string | null {
	if (!pattern) {
		return null;
	}
	let output = '';
	let literal = '';
	let lastIndex = 0;
	for (const match of pattern.matchAll(DIRECTIVE)) {
		literal += pattern.slice(lastIndex, match.index);
		lastIndex = match.index + match[0].length;
		if (match[0] === '%%') {
			literal += '%';
			continue;
		}
		const token = DAYJS_TOKENS[match[0]];
		const escaped = escapeLiteral(literal);
		if (!token || escaped === null) {
			return null;
		}
		output += escaped + token;
		literal = '';
	}
	const tail = escapeLiteral(literal + pattern.slice(lastIndex));
	return tail === null ? null : output + tail;
}

/** The dayjs locale closest to a BCP 47 tag among the loaded ones (`vi-VN` → `vi`), else `en`. */
export function dayjsLocaleOf(locale: string): string {
	const lower = locale.toLowerCase();
	if (dayjs.Ls[lower]) {
		return lower;
	}
	const base = lower.split('-')[0];
	return dayjs.Ls[base] ? base : 'en';
}

/** Formats a date with a strftime pattern, or answers `null` when the pattern cannot be converted. */
export function formatStrftime(date: Date, pattern: string | null | undefined, locale: string): string | null {
	const format = strftimeToDayjs(pattern);
	return format === null ? null : dayjs(date).locale(dayjsLocaleOf(locale)).format(format);
}

const WEEK_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export type WeekDayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** A language record's `first_day_of_week` (`monday`) as the 0 = Sunday index date pickers take. */
export function weekDayIndexOf(day: string | null | undefined): WeekDayIndex | undefined {
	const index = WEEK_DAYS.indexOf((day ?? '').toLowerCase() as typeof WEEK_DAYS[number]);
	return index < 0 ? undefined : index as WeekDayIndex;
}
