/**
 * One entry of a form column's `fields`: a field name, or an inline row whose items are
 * `$$ns:key` / `$$key` (translated text), `@@field` (that field's input or value) or literal text.
 */
export type FormColumnField = string | string[];

export type InlineRowItem =
	| { kind: 'text', key: string, ns?: string }
	| { kind: 'field', name: string }
	| { kind: 'literal', text: string };

const textPrefix = '$$';
const fieldPrefix = '@@';

export function parseInlineRowItem(item: string): InlineRowItem {
	if (item.startsWith(fieldPrefix)) {
		return { kind: 'field', name: item.slice(fieldPrefix.length) };
	}
	if (item.startsWith(textPrefix)) {
		const ref = item.slice(textPrefix.length);
		const colon = ref.indexOf(':');
		return colon > 0 ? { kind: 'text', ns: ref.slice(0, colon), key: ref.slice(colon + 1) } : { kind: 'text', key: ref };
	}
	return { kind: 'literal', text: item };
}

/** The field names an inline row renders, in order. */
export function inlineRowFieldNames(row: readonly string[]): string[] {
	return row.flatMap(item => {
		const parsed = parseInlineRowItem(item);
		return parsed.kind === 'field' ? [parsed.name] : [];
	});
}

/**
 * Every field name a column's `fields` renders, inline rows flattened: what visibility, field
 * locks, dirty detection and the partial save payload work on.
 */
export function columnFieldNames(fields: readonly unknown[] | null | undefined): string[] {
	if (!Array.isArray(fields)) {
		return [];
	}
	return fields.flatMap(entry => {
		if (typeof entry === 'string') {
			return [entry];
		}
		if (Array.isArray(entry)) {
			return inlineRowFieldNames(entry.filter((item): item is string => typeof item === 'string'));
		}
		return [];
	});
}
