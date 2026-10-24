import type { ClientErrorItem } from '@nikkierp/common/types';
import type { SearchItem } from '@nikkierp/ui/components/ExcelDataTable';


export const NAME_FIELD = 'name';
export const CODE_FIELD = 'code';
export const SEQUENCE_FIELD = 'sequence';
export const COLOR_FIELD = 'color_hex';
export const ARCHIVED_FIELD = 'is_archived';
export const VALUE_COLUMNS = [NAME_FIELD, CODE_FIELD, SEQUENCE_FIELD, COLOR_FIELD, ARCHIVED_FIELD];

/** The value fields a delta row may carry; the backend ignores any other. */
const WRITABLE_FIELDS = [CODE_FIELD, NAME_FIELD, SEQUENCE_FIELD, COLOR_FIELD];

const VALUES_FIELD = 'values';
const ROW_PATH = /^values\.(add|update|remove)\[(\d+)\]/;

/** Marks a row the table shows for an unsaved value; no server row carries it. */
export const DRAFT_ROW_FLAG = '$draft';

const DRAFT_ID_PREFIX = 'draft:';
/** The row editor refuses a row without an etag; a draft has none, and its edits never reach the server as such. */
const DRAFT_ETAG = 'draft';

export type ValueFields = Record<string, unknown>;

export type DraftValue = { key: string, fields: ValueFields };

export type ValueUpdate = { id: string, etag: string, fields: ValueFields };

/** The unsaved changes of one attribute's values. `attributeId` keeps them from leaking to another record. */
export type AttributeValueDrafts = {
	attributeId: string,
	added: DraftValue[],
	/** Edits of saved values, in the order first edited: the delta's `update` list keeps that order. */
	updated: ValueUpdate[],
	/** Saved value ids the next Save deletes. */
	removed: string[],
	nextKey: number,
};

export type SaveMode = 'create' | 'update';

export type ValuesDelta = {
	add?: ValueFields[],
	update?: ValueFields[],
	remove?: string[],
};

/** The table row behind each entry of the delta's lists, by position, to point the save's errors back at it. */
export type SentRows = { add: string[], update: string[], remove: string[] };

export type ValuesContribution = { payload: { values: ValuesDelta }, sent: SentRows };

export type ValueErrors = {
	/** Errors of one row, by table row id. */
	byRow: Record<string, ClientErrorItem[]>,
	/** Errors of the delta as a whole, or of a row no longer known. */
	general: ClientErrorItem[],
};

export function emptyDrafts(attributeId: string): AttributeValueDrafts {
	return { attributeId, added: [], updated: [], removed: [], nextKey: 1 };
}

/** The drafts of `attributeId`, or none when the state still belongs to the previously shown record. */
export function draftsFor(state: AttributeValueDrafts, attributeId: string): AttributeValueDrafts {
	return state.attributeId === attributeId ? state : emptyDrafts(attributeId);
}

export function hasDrafts(drafts: AttributeValueDrafts): boolean {
	return drafts.added.length > 0 || drafts.updated.length > 0 || drafts.removed.length > 0;
}

export function isDraftRow(item: Record<string, unknown> | undefined): boolean {
	return item?.[DRAFT_ROW_FLAG] === true;
}

/** A saved value with an unsaved edit: the table badges it "Changed", also after it remounts. */
export function isEditedRow(item: Record<string, unknown> | undefined, drafts: AttributeValueDrafts): boolean {
	const id = item?.id;
	return typeof id === 'string' && drafts.updated.some(update => update.id === id);
}

/** Only the fields a delta row may carry. A cleared colour is `null`: the schema refuses an empty string. */
export function pickValueFields(values: ValueFields): ValueFields {
	const out: ValueFields = {};
	for (const field of WRITABLE_FIELDS) {
		if (field in values && values[field] !== undefined) {
			out[field] = field === COLOR_FIELD && values[field] === '' ? null : values[field];
		}
	}
	return out;
}

export function addValue(drafts: AttributeValueDrafts, values: ValueFields): AttributeValueDrafts {
	const draft = { key: `${DRAFT_ID_PREFIX}${drafts.nextKey}`, fields: pickValueFields(values) };
	return { ...drafts, added: [...drafts.added, draft], nextKey: drafts.nextKey + 1 };
}

/** A row edit: `values` is the row editor's `{id, etag, ...changed}`. A draft row rewrites the draft. */
export function updateValue(drafts: AttributeValueDrafts, values: ValueFields): AttributeValueDrafts {
	const id = String(values.id ?? '');
	const changes = pickValueFields(values);
	if (id.startsWith(DRAFT_ID_PREFIX)) {
		const added = drafts.added.map(item => (
			item.key === id ? { ...item, fields: { ...item.fields, ...changes } } : item
		));
		return { ...drafts, added };
	}
	if (drafts.removed.includes(id)) {
		return drafts;
	}
	const existing = drafts.updated.find(item => item.id === id);
	if (existing) {
		const updated = drafts.updated.map(item => (
			item.id === id ? { ...item, fields: { ...item.fields, ...changes } } : item
		));
		return { ...drafts, updated };
	}
	return { ...drafts, updated: [...drafts.updated, { id, etag: String(values.etag ?? ''), fields: changes }] };
}

/**
 * Delete on a draft drops it; on a saved value it records the removal, and the row leaves the view
 * until Cancel discards the drafts. A removed value keeps no edit: the backend refuses to update
 * what it removes.
 */
export function removeValue(drafts: AttributeValueDrafts, item: Record<string, unknown>): AttributeValueDrafts {
	const id = String(item.id ?? '');
	if (id.startsWith(DRAFT_ID_PREFIX)) {
		return { ...drafts, added: drafts.added.filter(draft => draft.key !== id) };
	}
	if (drafts.removed.includes(id)) {
		return drafts;
	}
	return {
		...drafts,
		removed: [...drafts.removed, id],
		updated: drafts.updated.filter(update => update.id !== id),
	};
}

/**
 * The `values` key of the attribute's create or update request, or `undefined` when nothing changed.
 * A create carries `add` only: a new attribute has no saved value to update or remove.
 */
export function buildValuesContribution(drafts: AttributeValueDrafts, mode: SaveMode): ValuesContribution | undefined {
	const update = mode === 'update' ? drafts.updated : [];
	const remove = mode === 'update' ? drafts.removed : [];
	if (drafts.added.length === 0 && update.length === 0 && remove.length === 0) {
		return undefined;
	}
	const values: ValuesDelta = {};
	if (drafts.added.length > 0) {
		values.add = drafts.added.map(item => ({ ...item.fields }));
	}
	if (update.length > 0) {
		values.update = update.map(item => ({ id: item.id, etag: item.etag, ...item.fields }));
	}
	if (remove.length > 0) {
		values.remove = [...remove];
	}
	return {
		payload: { values },
		sent: { add: drafts.added.map(item => item.key), update: update.map(item => item.id), remove: [...remove] },
	};
}

/** The saved rows not removed, with their drafted edits, then the drafts in the order added. */
export function mergeDraftRows(items: SearchItem[], drafts: AttributeValueDrafts): SearchItem[] {
	const saved = items
		.filter(item => !drafts.removed.includes(item.id))
		.map(item => {
			const update = drafts.updated.find(entry => entry.id === item.id);
			return update ? { ...item, ...update.fields } : item;
		});
	return [...saved, ...drafts.added.map(toDraftRow)];
}

function toDraftRow(draft: DraftValue): SearchItem {
	return {
		...draft.fields,
		id: draft.key,
		etag: DRAFT_ETAG,
		[DRAFT_ROW_FLAG]: true,
		[ARCHIVED_FIELD]: false,
	};
}

/**
 * The save's rejections addressed to the delta, each pinned on the table row it came from:
 * `values.add[1].name` is the second drafted row, `values.update[0].id` the first edited saved row,
 * `values.remove[2]` the third removed one.
 */
export function mapValueErrors(clientErrors: ClientErrorItem[], sent: SentRows | null): ValueErrors {
	const out: ValueErrors = { byRow: {}, general: [] };
	for (const item of clientErrors) {
		if (item.field !== VALUES_FIELD && !item.field?.startsWith(`${VALUES_FIELD}.`)) {
			continue;
		}
		const rowId = rowIdOfPath(item.field, sent);
		if (rowId) {
			(out.byRow[rowId] ??= []).push(item);
		}
		else {
			out.general.push(item);
		}
	}
	return out;
}

function rowIdOfPath(field: string, sent: SentRows | null): string | undefined {
	const match = ROW_PATH.exec(field);
	if (!match || !sent) {
		return undefined;
	}
	const list = match[1] as keyof SentRows;
	return sent[list][Number(match[2])];
}
