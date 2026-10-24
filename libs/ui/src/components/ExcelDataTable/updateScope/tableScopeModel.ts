/** Input types the user types into, where every keystroke is a change but not yet a decision. */
const TEXT_ENTRY_TYPES = new Set(['', 'text', 'number', 'email', 'search', 'tel', 'url', 'password']);

type ElementLike = { tagName?: string, readOnly?: boolean, type?: string } | null | undefined;

/**
 * Whether the element takes typed text. A table-scope row writes such a field when focus leaves its
 * cell (or on Enter), and any other control — a select, a checkbox, a picker — the moment it
 * changes. A read-only input is a Mantine `Select`, whose value only changes by picking.
 */
export function isTextEntryElement(element: ElementLike): boolean {
	const tag = element?.tagName?.toLowerCase();
	if (tag === 'textarea') {
		return !element?.readOnly;
	}
	if (tag !== 'input') {
		return false;
	}
	return !element?.readOnly && TEXT_ENTRY_TYPES.has((element?.type ?? '').toLowerCase());
}

/** A field's value as last written, so a blur after an unanswered write does not send it twice. */
export function sentValueKey(value: unknown): string {
	return JSON.stringify(value ?? null);
}

/** The fields to write now: changed against the row, and not already written with this value. */
export function fieldsToWrite(
	editableFields: string[],
	isDirty: (field: string) => boolean,
	valueOf: (field: string) => unknown,
	sent: ReadonlyMap<string, string>,
): string[] {
	return editableFields.filter(field => isDirty(field) && sent.get(field) !== sentValueKey(valueOf(field)));
}
