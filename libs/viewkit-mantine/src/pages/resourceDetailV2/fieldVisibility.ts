import * as dyn from '@nikkierp/common/dynamicModel';
import { evaluateCondition } from '@nikkierp/viewengine/metadata';

import { parseInlineRowItem } from '../resourceDetail/formColumnFields';

import type { FormColumnField } from '../resourceDetail/formColumnFields';
import type { OwnPropertySection } from '../resourceDetail/props';


export type FieldVisibilityMode = 'create' | 'update' | 'read';

/**
 * Whether a field will actually put something on screen in this mode.
 *
 * The rules differ per mode because the modes render through different components: the two form
 * modes go through `AutoField`, which has an input for only some data types, while read mode goes
 * through `renderDisplayFieldValue`, which can show a value of any type.
 *
 * Visibility is decided by the schema alone, never by the record: read mode labels an unset field
 * rather than dropping it, so the same fields appear whatever a given record happens to hold.
 */
export function isFieldVisible(
	modelSchema: dyn.ModelSchema,
	fieldName: string,
	mode: FieldVisibilityMode,
): boolean {
	const fieldDef = modelSchema.fields[fieldName];
	if (!fieldDef) {
		return false;
	}

	// Read mode shows every field the schema defines, unset ones included: a labelled blank states
	// that the record carries no value there, which a row that is simply absent cannot state.
	// `isRenderableFieldType` is deliberately NOT consulted — it asks whether `AutoField` has an
	// *input* for the type, while read mode goes through `renderDisplayFieldValue`, which displays
	// edge models and etags that no form can edit.
	if (mode === 'read') {
		return true;
	}

	// The primary key is assigned by the server and identifies the record being edited; offering
	// it as an input would invite a change that cannot be made.
	if (fieldDef.is_primary_key) {
		return false;
	}
	// The server assigns these, so neither form mode offers an input: on create it would invite a
	// value the server discards, and on update one it silently refuses. `created_at` and
	// `updated_at` are the live examples — auto-generated, yet not flagged as system fields.
	if (fieldDef.is_auto_generated) {
		return false;
	}
	// A derived value is never an input: the server computes or hydrates it and refuses a write,
	// so offering a field would invite a value it discards. Keyed off `is_computed` rather than
	// `is_system_field`, which means "the server owns this field's meaning" and so covers the
	// foreign keys a create form must still let the user pick.
	if (fieldDef.is_computed) {
		return false;
	}
	// The server refuses an update to this field, so update mode shows it rather than offering an
	// input: a rejected save is worse than a field the user can see but not change. Create mode is
	// unaffected -- `no_update` says nothing about the initial write.
	if (mode === 'update' && fieldDef.no_update) {
		return false;
	}
	if (mode === 'create' && fieldDef.is_system_field && !fieldDef.is_foreign_key) {
		return false;
	}
	return dyn.isRenderableFieldType(fieldDef);
}

/** Whether any of `fields` is visible, i.e. whether a block containing them is worth rendering. */
export function hasVisibleField(
	modelSchema: dyn.ModelSchema,
	fields: string[],
	mode: FieldVisibilityMode,
): boolean {
	return fields.some(field => isFieldVisible(modelSchema, field, mode));
}


/** How a field listed in a form block shows: as an input, as read-only text, or not at all. */
export type FieldPresentation = 'input' | 'readonly' | 'hidden';

/**
 * Update mode already keeps a field it cannot edit on screen as read-only text. With
 * `stableFieldLayout` create mode does the same, so every listed field renders in every mode and
 * the layout keeps its shape; a read-only field has no input, so it is never dirty and never sent.
 */
export function fieldPresentation(
	modelSchema: dyn.ModelSchema,
	fieldName: string,
	mode: FieldVisibilityMode,
	stableFieldLayout = false,
): FieldPresentation {
	if (!modelSchema.fields[fieldName]) {
		return 'hidden';
	}
	if (mode === 'read') {
		return 'readonly';
	}
	if (isFieldVisible(modelSchema, fieldName, mode)) {
		return 'input';
	}
	return mode === 'update' || stableFieldLayout ? 'readonly' : 'hidden';
}

/**
 * Whether a block is worth rendering. A stable layout keeps every block whose fields exist, even one
 * that holds nothing editable in this mode, so blocks do not come and go when Update is pressed.
 */
export function isBlockVisible(
	modelSchema: dyn.ModelSchema,
	fields: string[],
	mode: FieldVisibilityMode,
	stableFieldLayout = false,
): boolean {
	return hasVisibleField(modelSchema, fields, stableFieldLayout ? 'read' : mode);
}

export type VisibleWhen = OwnPropertySection['visibleWhen'];

/**
 * Whether `field` passes its `visibleWhen` rule against `values`: no rule means shown, and a list of
 * conditions must all hold. Unlike the schema rules above this one reads the record (or, while
 * editing, the live form), so a field comes and goes as the value it depends on changes.
 */
export function isFieldShownByCondition(
	visibleWhen: VisibleWhen, field: string, values: Record<string, unknown>,
): boolean {
	const rule = visibleWhen?.[field];
	if (!rule) {
		return true;
	}
	const conditions = Array.isArray(rule) ? rule : [rule];
	return conditions.every(condition => evaluateCondition(condition, values));
}

/** The top-level fields the `visibleWhen` conditions read: what a form must watch to keep them live. */
export function visibleWhenSourceFields(visibleWhen: VisibleWhen): string[] {
	const fields = Object.values(visibleWhen ?? {})
		.flatMap(rule => (Array.isArray(rule) ? rule : [rule]))
		.map(condition => condition.field.split('.')[0]);
	return [...new Set(fields)].sort();
}

/**
 * A block's `fields` without the ones whose `visibleWhen` fails. Inside an inline row only the
 * `@@field` item goes; a row left with none of its fields is dropped whole, since its text would
 * then label nothing.
 */
export function applyVisibleWhen(
	fields: readonly FormColumnField[], visibleWhen: VisibleWhen, values: Record<string, unknown>,
): FormColumnField[] {
	if (!visibleWhen) {
		return [...fields];
	}
	const shown = (name: string) => isFieldShownByCondition(visibleWhen, name, values);
	return fields.flatMap((entry): FormColumnField[] => {
		if (typeof entry === 'string') {
			return shown(entry) ? [entry] : [];
		}
		const kept = entry.filter(item => {
			const name = inlineFieldName(item);
			return name === undefined || shown(name);
		});
		const hasField = (row: string[]) => row.some(item => inlineFieldName(item) !== undefined);
		return hasField(entry) && !hasField(kept) ? [] : [kept];
	});
}

function inlineFieldName(item: string): string | undefined {
	const parsed = parseInlineRowItem(item);
	return parsed.kind === 'field' ? parsed.name : undefined;
}
