import type { ClientErrorItem } from '@nikkierp/common/types';


/** One attribute line as the editor holds it; `key` is stable across edits, `id` is the saved line's. */
export type AttributeLineDraft = {
	key: string,
	attributeId: string,
	valueIds: string[],
	sequence: number | null,
	id?: string,
	/** The mode the line was applied with; absent on a line not saved yet. */
	snapshot?: string,
};

export type ExclusionDraft = { key: string, leftValueId: string, rightValueId: string };

/** The template's attribute configuration being edited: always the FULL desired state. */
export type TemplateConfigDraft = {
	lines: AttributeLineDraft[],
	exclusions: ExclusionDraft[],
	nextKey: number,
};

export type AttributeLinePayload = { attribute_id: string, value_ids: string[], sequence?: number };

export type ExclusionPayload = { left_value_id: string, right_value_id: string };

export type ConfigPayload = { attribute_lines: AttributeLinePayload[], exclusions: ExclusionPayload[] };

/** The editor row behind each entry of the sent lists, by position, to pin the save's errors back on it. */
export type SentConfigRows = { lines: string[], exclusions: string[] };

export type ConfigContribution = { payload: ConfigPayload, sent: SentConfigRows };

export type ConfigErrors = {
	lines: Record<string, ClientErrorItem[]>,
	exclusions: Record<string, ClientErrorItem[]>,
	general: ClientErrorItem[],
};

const LINE_PATH = /^attribute_lines\[(\d+)\]/;
const EXCLUSION_PATH = /^exclusions\[(\d+)\]/;
const CONFIG_FIELDS = ['attribute_lines', 'exclusions'];

export function emptyConfig(): TemplateConfigDraft {
	return { lines: [], exclusions: [], nextKey: 1 };
}

/**
 * The record's `attribute_configuration` (`{attribute_lines, exclusions}`) as an editable draft.
 * Anything malformed reads as no configuration rather than failing the page.
 */
export function configFromRecord(raw: unknown): TemplateConfigDraft {
	const config = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
	const rawLines = Array.isArray(config.attribute_lines) ? config.attribute_lines : [];
	const rawExclusions = Array.isArray(config.exclusions) ? config.exclusions : [];
	let nextKey = 1;
	const lines = rawLines.map((item: Record<string, unknown>): AttributeLineDraft => ({
		key: `line:${nextKey++}`,
		attributeId: String(item.attribute_id ?? ''),
		valueIds: Array.isArray(item.value_ids) ? item.value_ids.map(String) : [],
		sequence: typeof item.sequence === 'number' ? item.sequence : null,
		id: typeof item.id === 'string' ? item.id : undefined,
		snapshot: typeof item.variant_creation_snapshot === 'string' ? item.variant_creation_snapshot : undefined,
	}));
	const exclusions = rawExclusions.map((item: Record<string, unknown>): ExclusionDraft => ({
		key: `exclusion:${nextKey++}`,
		leftValueId: String(item.left_value_id ?? ''),
		rightValueId: String(item.right_value_id ?? ''),
	}));
	return { lines: sortLines(lines), exclusions, nextKey };
}

function sortLines(lines: AttributeLineDraft[]): AttributeLineDraft[] {
	return [...lines].sort((left, right) => (left.sequence ?? 0) - (right.sequence ?? 0));
}

/** A blank row at the end, numbered after the last one. */
export function addLine(draft: TemplateConfigDraft): TemplateConfigDraft {
	const sequence = draft.lines.reduce((max, line) => Math.max(max, line.sequence ?? 0), 0) + 1;
	const line: AttributeLineDraft = { key: `line:${draft.nextKey}`, attributeId: '', valueIds: [], sequence };
	return { ...draft, lines: [...draft.lines, line], nextKey: draft.nextKey + 1 };
}

/** A row the table's insert row confirmed, numbered after the last one. */
export function addLineWith(
	draft: TemplateConfigDraft, attributeId: string, valueIds: string[],
): TemplateConfigDraft {
	const added = addLine(draft);
	const key = added.lines[added.lines.length - 1].key;
	return setLineValues(setLineAttribute(added, key, attributeId), key, valueIds);
}

/**
 * The rows in the order the user dragged them to, numbered 1..n: the sequence is never shown, so
 * the order on screen is the only one there is. Keys it does not name keep their place at the end.
 */
export function reorderLines(draft: TemplateConfigDraft, orderedKeys: string[]): TemplateConfigDraft {
	const byKey = new Map(draft.lines.map(line => [line.key, line]));
	const named = orderedKeys.map(key => byKey.get(key)).filter((line): line is AttributeLineDraft => !!line);
	const rest = draft.lines.filter(line => !orderedKeys.includes(line.key));
	const lines = [...named, ...rest].map((line, index) => ({ ...line, sequence: index + 1 }));
	return { ...draft, lines };
}

/** Whether a saved line was edited: another attribute, other values, or another place. */
export function isLineChanged(saved: TemplateConfigDraft, line: AttributeLineDraft): boolean {
	const before = saved.lines.find(other => other.key === line.key);
	if (!before) {
		return false;
	}
	const sameValues = [...before.valueIds].sort().join('|') === [...line.valueIds].sort().join('|');
	return before.attributeId !== line.attributeId || before.sequence !== line.sequence || !sameValues;
}

/** Choosing another attribute clears the values: they belonged to the previous one. */
export function setLineAttribute(
	draft: TemplateConfigDraft, key: string, attributeId: string,
): TemplateConfigDraft {
	return pruneExclusions(mapLine(draft, key, line => (
		line.attributeId === attributeId
			? line
			: { ...line, attributeId, valueIds: [], id: undefined, snapshot: undefined }
	)));
}

export function setLineValues(draft: TemplateConfigDraft, key: string, valueIds: string[]): TemplateConfigDraft {
	return pruneExclusions(mapLine(draft, key, line => ({ ...line, valueIds: [...valueIds] })));
}

export function setLineSequence(
	draft: TemplateConfigDraft, key: string, sequence: number | null,
): TemplateConfigDraft {
	return mapLine(draft, key, line => ({ ...line, sequence }));
}

export function removeLine(draft: TemplateConfigDraft, key: string): TemplateConfigDraft {
	return pruneExclusions({ ...draft, lines: draft.lines.filter(line => line.key !== key) });
}

function mapLine(
	draft: TemplateConfigDraft, key: string, change: (line: AttributeLineDraft) => AttributeLineDraft,
): TemplateConfigDraft {
	return { ...draft, lines: draft.lines.map(line => (line.key === key ? change(line) : line)) };
}

/** An exclusion only names selected values; one losing a value would be refused, so it goes with it. */
function pruneExclusions(draft: TemplateConfigDraft): TemplateConfigDraft {
	const selected = new Set(draft.lines.flatMap(line => line.valueIds));
	const exclusions = draft.exclusions
		.filter(item => selected.has(item.leftValueId) && selected.has(item.rightValueId));
	return exclusions.length === draft.exclusions.length ? draft : { ...draft, exclusions };
}

/** Adds the pair unless it is already excluded, in either order. */
export function addExclusion(
	draft: TemplateConfigDraft, leftValueId: string, rightValueId: string,
): TemplateConfigDraft {
	if (!leftValueId || !rightValueId || leftValueId === rightValueId) {
		return draft;
	}
	const pair = pairKey(leftValueId, rightValueId);
	if (draft.exclusions.some(item => pairKey(item.leftValueId, item.rightValueId) === pair)) {
		return draft;
	}
	const exclusion = { key: `exclusion:${draft.nextKey}`, leftValueId, rightValueId };
	return { ...draft, exclusions: [...draft.exclusions, exclusion], nextKey: draft.nextKey + 1 };
}

export function removeExclusion(draft: TemplateConfigDraft, key: string): TemplateConfigDraft {
	return { ...draft, exclusions: draft.exclusions.filter(item => item.key !== key) };
}

function pairKey(left: string, right: string): string {
	return left < right ? `${left}|${right}` : `${right}|${left}`;
}

/** The lines that name an attribute; a blank row is the user's scratch space and is not sent. */
function sentLines(draft: TemplateConfigDraft): AttributeLineDraft[] {
	return draft.lines.filter(line => line.attributeId !== '');
}

export function toConfigPayload(draft: TemplateConfigDraft): ConfigPayload {
	return {
		attribute_lines: sentLines(draft).map(line => ({
			attribute_id: line.attributeId,
			value_ids: [...line.valueIds],
			...(line.sequence === null ? {} : { sequence: line.sequence }),
		})),
		exclusions: draft.exclusions.map(item => ({
			left_value_id: item.leftValueId, right_value_id: item.rightValueId,
		})),
	};
}

/** Order-insensitive, so reordering rows or values without changing them sends nothing. */
function canonical(payload: ConfigPayload): string {
	const lines = payload.attribute_lines
		.map(line => ({ ...line, value_ids: [...line.value_ids].sort() }))
		.sort((left, right) => left.attribute_id.localeCompare(right.attribute_id));
	const exclusions = payload.exclusions
		.map(item => pairKey(item.left_value_id, item.right_value_id))
		.sort();
	return JSON.stringify({ lines, exclusions });
}

export function isConfigChanged(saved: TemplateConfigDraft, draft: TemplateConfigDraft): boolean {
	return canonical(toConfigPayload(saved)) !== canonical(toConfigPayload(draft));
}

/**
 * The `attribute_lines` + `exclusions` keys of the template's own create or update, or `undefined`
 * while the draft equals what is saved. Both keys go together: the backend reads them as the full
 * desired state, so sending one alone is still a complete configuration.
 */
export function buildConfigContribution(
	saved: TemplateConfigDraft, draft: TemplateConfigDraft,
): ConfigContribution | undefined {
	if (!isConfigChanged(saved, draft)) {
		return undefined;
	}
	return {
		payload: toConfigPayload(draft),
		sent: { lines: sentLines(draft).map(line => line.key), exclusions: draft.exclusions.map(item => item.key) },
	};
}

/**
 * The save's rejections addressed to the configuration, each pinned on the row it came from:
 * `attribute_lines[3].attribute_id` is the fourth sent line, `exclusions[2]` the third exclusion.
 */
export function mapConfigErrors(clientErrors: ClientErrorItem[], sent: SentConfigRows | null): ConfigErrors {
	const out: ConfigErrors = { lines: {}, exclusions: {}, general: [] };
	for (const item of clientErrors) {
		const field = item.field ?? '';
		if (!isConfigField(field)) {
			continue;
		}
		const line = LINE_PATH.exec(field);
		const exclusion = EXCLUSION_PATH.exec(field);
		const lineKey = line && sent ? sent.lines[Number(line[1])] : undefined;
		const exclusionKey = exclusion && sent ? sent.exclusions[Number(exclusion[1])] : undefined;
		if (lineKey) {
			(out.lines[lineKey] ??= []).push(item);
		}
		else if (exclusionKey) {
			(out.exclusions[exclusionKey] ??= []).push(item);
		}
		else {
			out.general.push(item);
		}
	}
	return out;
}

function isConfigField(field: string): boolean {
	return CONFIG_FIELDS.some(name => field === name || field.startsWith(`${name}[`) || field.startsWith(`${name}.`));
}

/** Whether a save or preview was refused because the template changed since it was read. */
export function isEtagMismatch(clientErrors: ClientErrorItem[]): boolean {
	return clientErrors.some(item => (item.key.split(/[:.]/).pop() ?? item.key) === 'err_etag_mismatched');
}
