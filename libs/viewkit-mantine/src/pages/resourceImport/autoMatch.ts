import { normalizeMatchKey } from './targets';

import type { ImportTarget } from './targets';
import type { RestImportMapping } from '@nikkierp/common/dynamicModel';


/**
 * One line of the mapping table. The two columns are independent lists aligned by index: a row
 * with both a source and a target is a mapping, a row with only a target is an unmapped field,
 * a row with only a source is an ignored file column.
 */
export type MappingRow = {
	source: string | null,
	target: ImportTarget | null,
};

/**
 * Pairs every target with the file header that spells its label (current language, then default
 * language, then field name). Mandatory targets come first so the user sees what still needs a
 * column; unmatched headers trail as ignored rows.
 */
export function autoMatch(headers: string[], targets: ImportTarget[]): MappingRow[] {
	const headerByKey = new Map<string, string>();
	for (const header of headers) {
		const key = normalizeMatchKey(header);
		if (key && !headerByKey.has(key)) {
			headerByKey.set(key, header);
		}
	}
	const taken = new Set<string>();
	const ordered = [...targets].sort((a, b) => Number(b.isMandatory) - Number(a.isMandatory));
	const rows: MappingRow[] = ordered.map((target) => {
		const header = target.matchKeys
			.map(key => headerByKey.get(key))
			.find(h => h !== undefined && !taken.has(h));
		if (header !== undefined) {
			taken.add(header);
		}
		return { source: header ?? null, target };
	});
	for (const header of headers) {
		if (header && !taken.has(header)) {
			taken.add(header);
			rows.push({ source: header, target: null });
		}
	}
	return rows;
}

/** Moves one cell of the source column, leaving the target column where it is. */
export function moveSource(rows: MappingRow[], from: number, to: number): MappingRow[] {
	const sources = reorder(rows.map(row => row.source), from, to);
	return rows.map((row, i) => ({ ...row, source: sources[i] }));
}

/** Moves one cell of the target column, leaving the source column where it is. */
export function moveTarget(rows: MappingRow[], from: number, to: number): MappingRow[] {
	const targets = reorder(rows.map(row => row.target), from, to);
	return rows.map((row, i) => ({ ...row, target: targets[i] }));
}

export function missingMandatory(rows: MappingRow[]): ImportTarget[] {
	return rows
		.filter(row => row.target?.isMandatory && !row.source)
		.map(row => row.target as ImportTarget);
}

export function buildMappingPayload(
	rows: MappingRow[], languageCode: string, createMissing: boolean,
): RestImportMapping {
	return {
		language_code: languageCode,
		create_missing_references: createMissing,
		columns: rows
			.filter(row => row.source && row.target)
			.map(row => ({ source: row.source as string, target: (row.target as ImportTarget).name })),
	};
}

function reorder<T>(items: T[], from: number, to: number): T[] {
	if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
		return items;
	}
	const moved = [...items];
	const [item] = moved.splice(from, 1);
	moved.splice(to, 0, item);
	return moved;
}
