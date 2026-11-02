/**
 * A "field group display": one or more items shown together on a row under a translated `label` (an
 * i18n key, `ns:key` allowed; defaults to the first field's schema label). `fields` items are
 * `@@field` (that field's input, or its value in read mode), `$$ns:key` / `$$key` (translated text)
 * or literal text. `widths[i]` sizes `fields[i]` (a CSS length; nullish leaves it to the input's own
 * width). `isFullRow` gives the group the whole row of the form grid instead of one track.
 */
export type FieldGroupDisplay = {
	label?: string,
	fields: string[],
	widths?: (string | null | undefined)[],
	isFullRow?: boolean,
};

/** One entry of a form column's `fields`: a field name, or a field group display. */
export type FormColumnField = string | FieldGroupDisplay;

export function isFieldGroupDisplay(entry: unknown): entry is FieldGroupDisplay {
	return typeof entry === 'object' && entry !== null && !Array.isArray(entry)
		&& Array.isArray((entry as Partial<FieldGroupDisplay>).fields);
}

export type InlineRowItem =
	| { kind: 'text', key: string, ns?: string }
	| { kind: 'field', name: string, width?: string }
	| { kind: 'literal', text: string };

const textPrefix = '$$';
const fieldPrefix = '@@';

export function parseInlineRowItem(item: string, width?: string | null): InlineRowItem {
	if (item.startsWith(fieldPrefix)) {
		const name = item.slice(fieldPrefix.length);
		return width ? { kind: 'field', name, width } : { kind: 'field', name };
	}
	if (item.startsWith(textPrefix)) {
		const ref = item.slice(textPrefix.length);
		const colon = ref.indexOf(':');
		return colon > 0 ? { kind: 'text', ns: ref.slice(0, colon), key: ref.slice(colon + 1) } : { kind: 'text', key: ref };
	}
	return { kind: 'literal', text: item };
}

/** A group's items parsed, each field item carrying its width from the same index of `widths`. */
export function groupItemsOf(group: FieldGroupDisplay): InlineRowItem[] {
	return group.fields.map((item, index) => parseInlineRowItem(item, group.widths?.[index]));
}

export function isFieldItem(item: string): boolean {
	return item.startsWith(fieldPrefix);
}

/** The field names an inline row renders, in order. */
export function inlineRowFieldNames(row: readonly string[]): string[] {
	return row.flatMap(item => {
		const parsed = parseInlineRowItem(item);
		return parsed.kind === 'field' ? [parsed.name] : [];
	});
}

/**
 * Every field name a column's `fields` renders, groups flattened, each name once however often it
 * appears: what visibility, field locks, dirty detection and the partial save payload work on.
 */
export function columnFieldNames(fields: readonly unknown[] | null | undefined): string[] {
	if (!Array.isArray(fields)) {
		return [];
	}
	const names = fields.flatMap(entry => {
		if (typeof entry === 'string') {
			return [entry];
		}
		if (isFieldGroupDisplay(entry)) {
			return inlineRowFieldNames(entry.fields.filter((item): item is string => typeof item === 'string'));
		}
		return [];
	});
	return [...new Set(names)];
}
