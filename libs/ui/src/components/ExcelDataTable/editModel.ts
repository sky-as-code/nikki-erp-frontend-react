import * as dyn from '@nikkierp/common/dynamicModel';

import type { SearchItem } from './types';


/**
 * Whether a column takes an input in inline update mode. Mirrors the detail form's update-mode
 * visibility: keys, auto-generated, computed and `no_update` fields are shown as text; so is any
 * column reached through an edge (`edge.field`), which belongs to another record.
 */
export function isRowEditableField(modelSchema: dyn.ModelSchema | undefined, field: string): boolean {
	if (!modelSchema || field.includes('.')) {
		return false;
	}
	const fieldDef = modelSchema.fields[field];
	if (!fieldDef || fieldDef.is_primary_key || fieldDef.is_auto_generated || fieldDef.is_computed) {
		return false;
	}
	if (fieldDef.no_update || fieldDef.is_edge_model) {
		return false;
	}
	return dyn.isRenderableFieldType(fieldDef);
}

/**
 * Why an inline row update cannot be sent, or `undefined` when it can.
 *
 * `unchanged` is the ordinary case and not a failure: nothing was edited, so there is nothing to
 * write. The other two are: a row the search projection returned without the columns a concurrent
 * write is checked against.
 */
export type RowUpdateRefusal = 'unchanged' | 'no-id' | 'no-etag';

export type RowUpdatePayload = {
	payload?: Record<string, unknown>,
	refusal?: RowUpdateRefusal,
};

/**
 * The partial update payload: `id`, `etag`, and only the editable fields react-hook-form marked
 * dirty.
 *
 * The `etag` is required rather than merely included when present. It is what makes the write
 * optimistic-concurrency checked, and the backend forces it into every read projection precisely
 * so that a row read from a list carries one. A row without it can only have come from a response
 * predating that, and saving it anyway would silently overwrite a concurrent edit — so this
 * refuses, loudly, rather than writing unchecked.
 */
export function buildRowUpdatePayload(
	data: Record<string, unknown>,
	dirtyFields: Record<string, unknown> | undefined,
	item: SearchItem,
	editableFields: string[],
): RowUpdatePayload {
	if (typeof item.id !== 'string' && typeof item.id !== 'number') {
		return { refusal: 'no-id' };
	}
	const payload: Record<string, unknown> = { id: item.id };
	const dirty = dirtyFields ?? {};
	let changed = 0;
	for (const field of editableFields) {
		if (dirty[field] && field in data) {
			payload[field] = data[field];
			changed += 1;
		}
	}
	if (changed === 0) {
		return { refusal: 'unchanged' };
	}
	if (typeof item.etag !== 'string' || item.etag === '') {
		return { refusal: 'no-etag' };
	}
	payload.etag = item.etag;
	return { payload };
}
