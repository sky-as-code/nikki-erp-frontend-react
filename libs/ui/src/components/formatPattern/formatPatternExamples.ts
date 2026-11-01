import { groupDigits, parseGrouping } from '../Localized/numberGrouping';
import { formatStrftime, STRFTIME_SUPPORTED_DIRECTIVES } from '../Localized/strftime';


/** The number a grouping example groups: long enough to show three groups of any common style. */
export const GROUPING_SAMPLE_DIGITS = '1234567';

/** `pattern` applied to `date`, or `null` when the browser cannot render the pattern. */
export function strftimeExample(pattern: string | null | undefined, locale: string, date: Date): string | null {
	return formatStrftime(date, pattern, locale);
}

/** {@link GROUPING_SAMPLE_DIGITS} grouped by `grouping` (`[3,2,-1]` → `12,34,567`), or `null` when invalid. */
export function groupingExample(grouping: string | null | undefined, separator: string): string | null {
	const parsed = parseGrouping(grouping);
	return parsed ? groupDigits(GROUPING_SAMPLE_DIGITS, parsed, separator) : null;
}

export type DirectiveExample = { directive: string, example: string };

/** Every supported directive with what it prints for `date`, for the help list. */
export function strftimeDirectiveExamples(locale: string, date: Date): DirectiveExample[] {
	return STRFTIME_SUPPORTED_DIRECTIVES.map(directive => ({
		directive,
		example: formatStrftime(date, directive, locale) ?? '',
	}));
}
