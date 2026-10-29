import type { ClientErrorItem } from '@nikkierp/common/types';
import type { SearchItem } from '@nikkierp/ui/components/ExcelDataTable';


export const VARIANT_FIELD = 'product_variant_id';
export const QUANTITY_FIELD = 'demand_quantity';
export const UOM_FIELD = 'uom_id';
export const MOVE_COLUMNS = [VARIANT_FIELD, QUANTITY_FIELD, UOM_FIELD];

/** The move fields a delta row may carry; the backend derives every other one from the transfer. */
const WRITABLE_FIELDS = [VARIANT_FIELD, QUANTITY_FIELD, UOM_FIELD];

const MOVES_FIELD = 'moves';
const ROW_PATH = /^moves\.(add|update|remove)\[(\d+)\]/;

/** Marks a row the table shows for an unsaved move; no server row carries it. */
export const DRAFT_ROW_FLAG = '$draft';

const DRAFT_ID_PREFIX = 'draft:';
/** The row editor refuses a row without an etag; a draft has none, and its edits never reach the server as such. */
const DRAFT_ETAG = 'draft';

export type MoveFields = Record<string, unknown>;

export type DraftMove = { key: string, fields: MoveFields };

export type MoveUpdate = { id: string, etag: string, fields: MoveFields };

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
	add?: MoveFields[],
	update?: MoveFields[],
	remove?: string[],
};

/** The table row behind each entry of the delta's lists, by position, to point the save's errors back at it. */
export type SentRows = { add: string[], update: string[], remove: string[] };

export type MovesContribution = { payload: { moves: MovesDelta }, sent: SentRows };

export type MoveErrors = {
	/** Errors of one row, by table row id. */
	byRow: Record<string, ClientErrorItem[]>,
	/** Errors of the delta as a whole, or of a row no longer known. */
	general: ClientErrorItem[],
};

export function emptyMoveDrafts(transferId: string): MoveDrafts {
	return { transferId, added: [], updated: [], removed: [], nextKey: 1 };
}

/** The drafts of `transferId`, or none when the state still belongs to the previously shown record. */
export function moveDraftsFor(state: MoveDrafts, transferId: string): MoveDrafts {
	return state.transferId === transferId ? state : emptyMoveDrafts(transferId);
}

export function isDraftMoveRow(item: Record<string, unknown> | undefined): boolean {
	return item?.[DRAFT_ROW_FLAG] === true;
}

/** A saved move with an unsaved edit: the table badges it "Changed", also after it remounts. */
export function isEditedMoveRow(item: Record<string, unknown> | undefined, drafts: MoveDrafts): boolean {
	const id = item?.id;
	return typeof id === 'string' && drafts.updated.some(update => update.id === id);
}

/** Only the fields a delta row may carry. A cleared unit is `null`: the move then takes the variant's. */
export function pickMoveFields(values: MoveFields): MoveFields {
	const out: MoveFields = {};
	for (const field of WRITABLE_FIELDS) {
		if (field in values && values[field] !== undefined) {
			out[field] = field === UOM_FIELD && values[field] === '' ? null : values[field];
		}
	}
	return out;
}

export function addMove(drafts: MoveDrafts, values: MoveFields): MoveDrafts {
	const draft = { key: `${DRAFT_ID_PREFIX}${drafts.nextKey}`, fields: pickMoveFields(values) };
	return { ...drafts, added: [...drafts.added, draft], nextKey: drafts.nextKey + 1 };
}

/** A row edit: `values` is the row editor's `{id, etag, ...changed}`. A draft row rewrites the draft. */
export function updateMove(drafts: MoveDrafts, values: MoveFields): MoveDrafts {
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
	return { ...drafts, updated: [...drafts.updated, { id, etag: String(values.etag ?? ''), fields: changes }] };
}

/**
 * Delete on a draft drops it; on a saved move it records the removal, and the row leaves the view
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
	return {
		...drafts,
		removed: [...drafts.removed, id],
		updated: drafts.updated.filter(update => update.id !== id),
	};
}

/**
 * The `moves` key of the transfer's create or update request, or `undefined` when nothing changed.
 * A create carries `add` only: a new transfer has no saved move to update or remove.
 */
export function buildMovesContribution(drafts: MoveDrafts, mode: SaveMode): MovesContribution | undefined {
	const update = mode === 'update' ? drafts.updated : [];
	const remove = mode === 'update' ? drafts.removed : [];
	if (drafts.added.length === 0 && update.length === 0 && remove.length === 0) {
		return undefined;
	}
	const moves: MovesDelta = {};
	if (drafts.added.length > 0) {
		moves.add = drafts.added.map(item => ({ ...item.fields }));
	}
	if (update.length > 0) {
		moves.update = update.map(item => ({ id: item.id, etag: item.etag, ...item.fields }));
	}
	if (remove.length > 0) {
		moves.remove = [...remove];
	}
	return {
		payload: { moves },
		sent: { add: drafts.added.map(item => item.key), update: update.map(item => item.id), remove: [...remove] },
	};
}

/** The saved rows not removed, with their drafted edits, then the drafts in the order added. */
export function mergeDraftMoveRows(items: SearchItem[], drafts: MoveDrafts): SearchItem[] {
	const saved = items
		.filter(item => !drafts.removed.includes(item.id))
		.map(item => {
			const update = drafts.updated.find(entry => entry.id === item.id);
			return update ? { ...item, ...update.fields } : item;
		});
	return [...saved, ...drafts.added.map(toDraftRow)];
}

function toDraftRow(draft: DraftMove): SearchItem {
	return { ...draft.fields, id: draft.key, etag: DRAFT_ETAG, [DRAFT_ROW_FLAG]: true };
}

/**
 * The save's rejections addressed to the delta, each pinned on the table row it came from:
 * `moves.add[1].demand_quantity` is the second drafted row, `moves.update[0].id` the first edited
 * saved row, `moves.remove[2]` the third removed one.
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
