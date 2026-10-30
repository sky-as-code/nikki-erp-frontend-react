import { ROW_SPAN_GROUP_KEY } from '@nikkierp/ui/components/ExcelDataTable';

import { ATTRIBUTE_FIELD, ATTRIBUTES_FIELD, QUANTITY_FIELD, TEMPLATE_FIELD, UOM_FIELD, VALUE_FIELD } from './moveGroups';

import type { MoveAttribute } from './moveGroups';
import type { ClientErrorItem } from '@nikkierp/common/types';
import type { SearchItem } from '@nikkierp/ui/components/ExcelDataTable';


const MOVES_FIELD = 'moves';
const ROW_PATH = /^moves\.(add|update|remove)\[(\d+)\]/;

/** Marks a group the table shows for an unsaved move; no server row carries it. */
export const DRAFT_ROW_FLAG = '$draft';

const DRAFT_ID_PREFIX = 'draft:';
/** A table-scope write refuses a row without an etag; a draft has none, and its edits never reach the server as such. */
const DRAFT_ETAG = 'draft';

/** A move in the template form: the template, its attribute values, the demand and the unit. */
export type MoveFields = {
	[TEMPLATE_FIELD]?: unknown,
	[ATTRIBUTES_FIELD]?: MoveAttribute[],
	[QUANTITY_FIELD]?: unknown,
	[UOM_FIELD]?: unknown,
};

export type DraftMove = { key: string, fields: MoveFields };

/** An edited saved move: `original` is what was read, so the delta sends only what changed. */
export type MoveUpdate = { id: string, etag: string, original: MoveFields, fields: MoveFields };

/** The unsaved changes of one transfer's moves. `transferId` keeps them from leaking to another record. */
export type MoveDrafts = {
	transferId: string,
	added: DraftMove[],
	/** Edits of saved moves, in the order first edited: the delta's `update` list keeps that order. */
	updated: MoveUpdate[],
	/** Saved move ids the next Save deletes. */
	removed: string[],
	nextKey: number,
};

export type SaveMode = 'create' | 'update';

export type MovesDelta = {
	add?: Record<string, unknown>[],
	update?: Record<string, unknown>[],
	remove?: string[],
};

/** The group behind each entry of the delta's lists, by position, to point the save's errors back at it. */
export type SentRows = { add: string[], update: string[], remove: string[] };

export type MovesContribution = { payload: { moves: MovesDelta }, sent: SentRows };

export type MoveErrors = {
	/** Errors of one group, by its id. */
	byRow: Record<string, ClientErrorItem[]>,
	/** Errors of the delta as a whole, or of a group no longer known. */
	general: ClientErrorItem[],
};

export function emptyMoveDrafts(transferId: string): MoveDrafts {
	return { transferId, added: [], updated: [], removed: [], nextKey: 1 };
}

/** The drafts of `transferId`, or none when the state still belongs to the previously shown record. */
export function moveDraftsFor(state: MoveDrafts, transferId: string): MoveDrafts {
	return state.transferId === transferId ? state : emptyMoveDrafts(transferId);
}

/** The group a table row stands for: a flat sub-row names it, a group is itself. */
function groupIdOf(row: Record<string, unknown> | undefined): string {
	return String(row?.[ROW_SPAN_GROUP_KEY] ?? row?.id ?? '');
}

export function isDraftMoveRow(row: Record<string, unknown> | undefined): boolean {
	return row?.[DRAFT_ROW_FLAG] === true;
}

/** A saved move with an unsaved edit: the table badges it "Changed", also after it remounts. */
export function isEditedMoveRow(row: Record<string, unknown> | undefined, drafts: MoveDrafts): boolean {
	const id = groupIdOf(row);
	return drafts.updated.some(update => update.id === id);
}

function pickAttributes(raw: unknown): MoveAttribute[] {
	return (Array.isArray(raw) ? raw as MoveAttribute[] : []).map(attribute => ({
		[ATTRIBUTE_FIELD]: attribute[ATTRIBUTE_FIELD] ?? null,
		[VALUE_FIELD]: attribute[VALUE_FIELD] ?? null,
	}));
}

/** Only the fields a delta row may carry. A cleared unit is `null`: the move then takes the variant's. */
export function pickMoveFields(values: Record<string, unknown>): MoveFields {
	const out: MoveFields = {};
	if (values[TEMPLATE_FIELD] !== undefined) out[TEMPLATE_FIELD] = values[TEMPLATE_FIELD];
	if (values[ATTRIBUTES_FIELD] !== undefined) out[ATTRIBUTES_FIELD] = pickAttributes(values[ATTRIBUTES_FIELD]);
	if (values[QUANTITY_FIELD] !== undefined) out[QUANTITY_FIELD] = values[QUANTITY_FIELD];
	if (values[UOM_FIELD] !== undefined) out[UOM_FIELD] = values[UOM_FIELD] === '' ? null : values[UOM_FIELD];
	return out;
}

/**
 * A group write as the table sends it, with the rule the attribute pickers rely on: another template
 * drops the group's attributes, which belonged to the old one.
 */
export function withTemplateRule(
	values: Record<string, unknown>, previous: SearchItem | undefined,
): Record<string, unknown> {
	if (!previous || values[TEMPLATE_FIELD] === previous[TEMPLATE_FIELD]) {
		return values;
	}
	return { ...values, [ATTRIBUTES_FIELD]: [] };
}

export function addMove(drafts: MoveDrafts, values: Record<string, unknown>): MoveDrafts {
	const draft = { key: `${DRAFT_ID_PREFIX}${drafts.nextKey}`, fields: pickMoveFields(values) };
	return { ...drafts, added: [...drafts.added, draft], nextKey: drafts.nextKey + 1 };
}

/** A group write (the whole group). A draft rewrites the draft; a saved move records it beside what was read. */
export function updateMove(
	drafts: MoveDrafts, values: Record<string, unknown>, original: SearchItem | undefined,
): MoveDrafts {
	const id = String(values.id ?? '');
	const changes = pickMoveFields(values);
	if (id.startsWith(DRAFT_ID_PREFIX)) {
		const added = drafts.added.map(item => (
			item.key === id ? { ...item, fields: { ...item.fields, ...changes } } : item
		));
		return { ...drafts, added };
	}
	if (drafts.removed.includes(id)) {
		return drafts;
	}
	if (drafts.updated.some(item => item.id === id)) {
		const updated = drafts.updated.map(item => (
			item.id === id ? { ...item, fields: { ...item.fields, ...changes } } : item
		));
		return { ...drafts, updated };
	}
	const update = { id, etag: String(values.etag ?? ''), original: pickMoveFields(original ?? {}), fields: changes };
	return { ...drafts, updated: [...drafts.updated, update] };
}

/**
 * Delete on a draft drops it; on a saved move it records the removal, and the group leaves the view
 * until Cancel discards the drafts. A removed move keeps no edit: the backend refuses to update what
 * it removes.
 */
export function removeMove(drafts: MoveDrafts, item: Record<string, unknown>): MoveDrafts {
	const id = String(item.id ?? '');
	if (id.startsWith(DRAFT_ID_PREFIX)) {
		return { ...drafts, added: drafts.added.filter(draft => draft.key !== id) };
	}
	if (drafts.removed.includes(id)) {
		return drafts;
	}
	return { ...drafts, removed: [...drafts.removed, id], updated: drafts.updated.filter(update => update.id !== id) };
}

const sameJson = (left: unknown, right: unknown) => JSON.stringify(left ?? null) === JSON.stringify(right ?? null);

/** A new move, always in the template form. An unset unit is left out: the move then takes the variant's. */
function addEntry(fields: MoveFields): Record<string, unknown> {
	const entry: Record<string, unknown> = {
		[TEMPLATE_FIELD]: fields[TEMPLATE_FIELD], [ATTRIBUTES_FIELD]: fields[ATTRIBUTES_FIELD] ?? [],
		[QUANTITY_FIELD]: fields[QUANTITY_FIELD],
	};
	if (fields[UOM_FIELD] != null) entry[UOM_FIELD] = fields[UOM_FIELD];
	return entry;
}

/**
 * An edit of a saved move: the demand and unit when they changed, and the template form only when the
 * template or an attribute did — that is what makes the backend resolve (and maybe replace) the variant.
 * `null` when nothing differs from what was read.
 */
function updateEntry(update: MoveUpdate): Record<string, unknown> | null {
	const { fields, original } = update;
	const entry: Record<string, unknown> = {};
	for (const field of [QUANTITY_FIELD, UOM_FIELD] as const) {
		if (field in fields && !sameJson(fields[field], original[field])) entry[field] = fields[field];
	}
	const template = fields[TEMPLATE_FIELD] ?? original[TEMPLATE_FIELD];
	const attributes = fields[ATTRIBUTES_FIELD] ?? original[ATTRIBUTES_FIELD] ?? [];
	if (!sameJson(template, original[TEMPLATE_FIELD]) || !sameJson(attributes, original[ATTRIBUTES_FIELD] ?? [])) {
		entry[TEMPLATE_FIELD] = template;
		entry[ATTRIBUTES_FIELD] = attributes;
	}
	return Object.keys(entry).length > 0 ? { id: update.id, etag: update.etag, ...entry } : null;
}

/**
 * The `moves` key of the transfer's create or update request, or `undefined` when nothing changed.
 * A create carries `add` only: a new transfer has no saved move to update or remove.
 */
export function buildMovesContribution(drafts: MoveDrafts, mode: SaveMode): MovesContribution | undefined {
	const updates = (mode === 'update' ? drafts.updated : [])
		.map(update => ({ id: update.id, entry: updateEntry(update) }))
		.filter((item): item is { id: string, entry: Record<string, unknown> } => item.entry !== null);
	const remove = mode === 'update' ? drafts.removed : [];
	if (drafts.added.length === 0 && updates.length === 0 && remove.length === 0) {
		return undefined;
	}
	const moves: MovesDelta = {};
	if (drafts.added.length > 0) moves.add = drafts.added.map(item => addEntry(item.fields));
	if (updates.length > 0) moves.update = updates.map(item => item.entry);
	if (remove.length > 0) moves.remove = [...remove];
	return {
		payload: { moves },
		sent: { add: drafts.added.map(item => item.key), update: updates.map(item => item.id), remove: [...remove] },
	};
}

/** The saved groups not removed, with their drafted edits, then the drafts in the order added. */
export function mergeDraftMoveRows(groups: SearchItem[], drafts: MoveDrafts): SearchItem[] {
	const saved = groups
		.filter(group => !drafts.removed.includes(group.id))
		.map(group => {
			const update = drafts.updated.find(entry => entry.id === group.id);
			return update ? { ...group, ...update.fields } : group;
		});
	return [...saved, ...drafts.added.map(toDraftRow)];
}

function toDraftRow(draft: DraftMove): SearchItem {
	return { [ATTRIBUTES_FIELD]: [], ...draft.fields, id: draft.key, etag: DRAFT_ETAG, [DRAFT_ROW_FLAG]: true };
}

/**
 * The save's rejections addressed to the delta, each pinned on the group it came from:
 * `moves.add[1].attributes[0].product_attribute_value_id` is the second drafted group,
 * `moves.update[0].id` the first edited saved one, `moves.remove[2]` the third removed one.
 */
export function mapMoveErrors(clientErrors: ClientErrorItem[], sent: SentRows | null): MoveErrors {
	const out: MoveErrors = { byRow: {}, general: [] };
	for (const item of clientErrors) {
		if (item.field !== MOVES_FIELD && !item.field?.startsWith(`${MOVES_FIELD}.`)) {
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
