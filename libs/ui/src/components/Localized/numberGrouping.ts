/**
 * A language record's digit grouping, Odoo's syntax: a JSON array of group sizes read from the units
 * digit leftwards. `0` repeats the previous size for the rest of the number and `-1` stops grouping;
 * without either, the digits left over form one last group. `[3,0]` is `1,234,567`, `[3,2,-1]`
 * `123,45,678`, `[3]` `1234,567`, and `[]` no grouping at all.
 */
export type DigitGrouping = number[];

/** The grouping a record stores (`"[3,0]"`), or `undefined` when the text is not an integer array. */
export function parseGrouping(text: string | null | undefined): DigitGrouping | undefined {
	if (!text) {
		return undefined;
	}
	try {
		const parsed: unknown = JSON.parse(text);
		return Array.isArray(parsed) && parsed.every(Number.isInteger) ? parsed as DigitGrouping : undefined;
	}
	catch {
		return undefined;
	}
}

/** The digit groups of `digits`, most significant first, as Odoo's `tools.misc.split` cuts them. */
function splitDigits(digits: string, grouping: DigitGrouping): string[] {
	const groups: string[] = [];
	let rest = digits;
	let lastSize = digits.length;
	for (const size of grouping) {
		if (!rest || size < 0) {
			break;
		}
		const repeated = size === 0 ? lastSize : size;
		do {
			groups.unshift(rest.slice(-repeated));
			rest = rest.slice(0, -repeated);
		} while (size === 0 && rest);
		lastSize = repeated;
	}
	return rest ? [rest, ...groups] : groups;
}

/** Inserts `separator` between the digit groups of an unsigned integer string. */
export function groupDigits(digits: string, grouping: DigitGrouping, separator: string): string {
	return splitDigits(digits, grouping).join(separator);
}

export type NumberInputGroupStyle = 'thousand' | 'lakh' | 'wan' | 'none';

/**
 * The closest grouping a number input can type with (react-number-format knows only three styles):
 * exact for `[3,0]`, `[3,2,0]`, `[4,0]` and `[]`, approximate for anything else.
 */
export function inputGroupStyleOf(grouping: DigitGrouping | undefined): NumberInputGroupStyle {
	if (!grouping) {
		return 'thousand';
	}
	if (grouping.length === 0 || grouping[0] <= 0) {
		return 'none';
	}
	if (grouping[0] === 4) {
		return 'wan';
	}
	return grouping[0] === 3 && grouping[1] === 2 ? 'lakh' : 'thousand';
}
