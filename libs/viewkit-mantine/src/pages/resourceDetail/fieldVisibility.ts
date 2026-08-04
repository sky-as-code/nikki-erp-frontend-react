import * as dyn from '@nikkierp/common/dynamicModel';


export type FieldVisibilityMode = 'create' | 'update' | 'read';

/**
 * Whether a field will actually put something on screen in this mode.
 *
 * The rules differ per mode because the modes render through different components: the two form
 * modes go through `AutoField`, which has an input for only some data types, while read mode goes
 * through `renderDisplayFieldValue`, which can show a value of any type.
 */
export function isFieldVisible(
	modelSchema: dyn.ModelSchema,
	fieldName: string,
	mode: FieldVisibilityMode,
	fieldValues?: Record<string, unknown>,
): boolean {
	const fieldDef = modelSchema.fields[fieldName];
	if (!fieldDef) {
		return false;
	}

	if (mode === 'read') {
		// A blank row tells the reader nothing, so an unset field is left out entirely.
		return hasValue(fieldValues?.[fieldName]);
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
	if (mode === 'create' && fieldDef.is_system_field) {
		return false;
	}
	return dyn.isRenderableFieldType(fieldDef);
}

/** Whether any of `fields` is visible, i.e. whether a block containing them is worth rendering. */
export function hasVisibleField(
	modelSchema: dyn.ModelSchema,
	fields: string[],
	mode: FieldVisibilityMode,
	fieldValues?: Record<string, unknown>,
): boolean {
	return fields.some(field => isFieldVisible(modelSchema, field, mode, fieldValues));
}

function hasValue(value: unknown): boolean {
	if (value === null || value === undefined || value === '') {
		return false;
	}
	return !(Array.isArray(value) && value.length === 0);
}
