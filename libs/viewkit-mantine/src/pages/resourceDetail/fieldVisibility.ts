import * as dyn from '@nikkierp/common/dynamicModel';


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

