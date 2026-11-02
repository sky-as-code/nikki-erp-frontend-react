const BREAK_TAG = /<br\s*\/?>/gi;
/** Attribute-less tags only: those are what react-i18next's `<Trans>` keeps as basic HTML nodes. */
const BASIC_TAG = /<\/?[a-z][a-z0-9]*\s*\/?>/gi;

/**
 * A translation as plain text, for where its basic HTML tags cannot render: a string attribute
 * (`title`, `aria-label`), a one-line menu entry. A line break becomes a space, any other tag goes.
 */
export function stripTranslationTags(text: string): string {
	if (!text.includes('<')) {
		return text;
	}
	return text.replace(BREAK_TAG, ' ').replace(BASIC_TAG, '').replace(/ {2,}/g, ' ').trim();
}
