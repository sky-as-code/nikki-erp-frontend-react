import { z } from 'zod';


const ErrorKeys = {
	invalidDataType: 'err_invalid_data_type',
	missingRequiredField: 'err_missing_required_field',
	formatMismatch: 'err_format_mismatch',
	invalidEmail: 'err_invalid_email',
	invalidUrl: 'err_invalid_url',
	invalidStringPattern: 'err_invalid_string_pattern',
	invalidStringLength: 'err_invalid_string_length',
	invalidNumberRange: 'err_invalid_number_range',
	notOneOf: 'err_not_one_of',
	invalidArrayLength: 'err_invalid_array_length',
} as const;

export type ModelSchema = {
	name: string,
	fields: ModelSchemaFieldsMap,
	etag?: string,
	/**
	 * Groups in which exactly one member may hold a value. The backend enforces this on validate;
	 * the form only disables the peers of a member that is already set.
	 */
	exclusive_required_field_groups?: string[][],
	/**
	 * The field identifying a record of this model to a human — what a relation select shows
	 * instead of a raw id. Absent on schemas that have not declared one yet; fall back to `id`.
	 */
	record_label_field?: string,
	/** Optional secondary field shown beneath the main label to disambiguate similar records. */
	record_sub_label_field?: string,
	label?: ModelSchemaLangJson,
	to_relations?: ModelSchemaRelation[],
	from_relations?: ModelSchemaRelation[],
};

export type ModelSchemaField = {
	name: string,
	label: ModelSchemaLangJson,
	data_type: ModelSchemaFieldDataType,
	description?: ModelSchemaLangJson,
	placeholder?: ModelSchemaLangJson,
	is_auto_generated?: boolean,
	/** The value is derived rather than supplied: a declared computation, or a hydrated edge. */
	is_computed?: boolean,
	/** Model-typed field standing for a relation. Never renderable as a column. */
	is_edge_model?: boolean,
	is_foreign_key?: boolean,
	/** Whether the value occupies a database column, and so can be filtered or sorted on. */
	is_persisted?: boolean,
	is_required_for_create?: boolean,
	is_required_for_update?: boolean,
	is_primary_key?: boolean,
	/**
	 * The server owns this field's meaning: a primary, versioning or tenant key, or a foreign
	 * key. Says nothing about whether the field has a column — that is `is_persisted`. A computed
	 * field is read-only yet not a system field, so it stays selectable as a column.
	 */
	is_system_field?: boolean,
	/** `is_computed && !is_persisted`: no column, whether a computed scalar or an edge. */
	is_virtual?: boolean,
	no_update?: boolean,
	rules?: unknown,
	default_value?: unknown,
};

export type ModelSchemaFieldsMap = Record<string, ModelSchemaField>;

export type ModelSchemaFieldDataTypeName =
	| 'boolean'
	| 'decimal'
	| 'email'
	| 'enumInt32'
	| 'enumString'
	| 'int32'
	| 'int64'
	| 'jsonmap'
	| 'model'
	| 'nikkiDate'
	| 'nikkiDateTime'
	| 'nikkiEtag'
	| 'nikkiLangCode'
	| 'nikkiLangJson'
	| 'nikkiSlug'
	| 'nikkiTime'
	| 'phone'
	| 'secret'
	| 'string'
	| 'ulid'
	| 'uuid'
	| 'url';

export type ModelSchemaFieldDataType = {
	name: ModelSchemaFieldDataTypeName,
	is_array?: boolean,
	isRequired?: boolean,
	options?: {
		[key in FieldDataTypeOptName]?: unknown;
	},
};

export type FieldDataTypeOptName = 'enumValues'
		| 'langJsonWhitelist'
		| 'length'
		| 'pattern'
		| 'range'
		| 'sanitizeType'
		| 'scale';

/** Localized UI strings (e.g. labels) keyed by locale tag. */
export type ModelSchemaLangJson = Record<string, string>;
export const LangJsonRefKey = '$ref';

export function newLangJsonRef(ref: string): ModelSchemaLangJson {
	return { [LangJsonRefKey]: ref };
}

export type ModelSchemaRelation = {
	edge: string,
	src_field?: string,
	dest_schema_name: string,
	relation_type: ModelSchemaRelationType,
};

export type ModelSchemaRelationType = 'many:one' | 'one:many' | 'many:many' | 'one:one';

/**
 * The outgoing relation whose foreign key is `fieldName`, if the field is one.
 *
 * Many-to-many entries carry no `src_field` — they are edges, not columns — so they never match
 * and a field only resolves to a relation it actually owns the key for.
 */
export function findRelationBySrcField(
	modelSchema: ModelSchema, fieldName: string,
): ModelSchemaRelation | undefined {
	return modelSchema.to_relations?.find(relation => relation.src_field === fieldName);
}

/**
 * The other members of the exclusive group `fieldName` belongs to; empty when it belongs to none.
 * A field in several groups yields the union, deduplicated and excluding itself.
 */
export function findExclusiveGroupPeers(modelSchema: ModelSchema, fieldName: string): string[] {
	const groups = modelSchema.exclusive_required_field_groups ?? [];
	const peers = groups
		.filter(group => group.includes(fieldName))
		.flatMap(group => group.filter(member => member !== fieldName));
	return Array.from(new Set(peers));
}

/**
 * Data types that `AutoField` can render an input for.
 *
 * Keep in step with its switch in `@nikkierp/ui/components/form/fields.tsx` — a type listed here
 * with no case renders an empty slot, and a case missing from here hides a field that would have
 * rendered. `model_schema.test.ts` guards the pairing.
 */
const RENDERABLE_DATA_TYPES: ReadonlySet<ModelSchemaFieldDataTypeName> = new Set([
	'boolean', 'decimal', 'email', 'enumString', 'int32', 'nikkiDate', 'nikkiDateTime',
	'nikkiLangJson', 'nikkiTime', 'secret', 'string', 'ulid',
]);

/** Whether a form can render an input for this field, as opposed to leaving an empty slot. */
export function isRenderableFieldType(fieldDef: ModelSchemaField): boolean {
	if (fieldDef.data_type.name === 'enumString' && !fieldDef.data_type.options?.enumValues) {
		// AutoField renders nothing for an enum with no values to choose from.
		return false;
	}
	return RENDERABLE_DATA_TYPES.has(fieldDef.data_type.name);
}

// Extra validation rule for the field. <br/>
// Format: [rule_name, rule_args] <br/>
// rule_name: The name of the rule. <br/>
// rule_args: has different formats depending on the rule. <br/>
// Example: ['arrlength', [0, 100]] means the array length must be between 0 and 100.
export type ModelSchemaFieldRule = [string, unknown];

/**
 * The validation schema for a form over `modelSchema`.
 *
 * Not a `ZodObject`: the blank-field transform below makes it a schema that *parses to* an object,
 * which is all `zodResolver` requires. Anything needing per-field schemas should read
 * `modelSchema.fields` rather than a `.shape` this no longer exposes.
 */
export type ModelValidationSchema = z.ZodType<Record<string, unknown>, any, any>;

export function buildValidationSchema(modelSchema: ModelSchema): ModelValidationSchema {
	const shape: Record<string, z.ZodTypeAny> = {};
	Object.entries(modelSchema.fields).forEach(([fieldName, fieldDef]) => {
		shape[fieldName] = buildFieldSchema(fieldDef);
	});
	// Blank optional fields parse to `undefined`, which zod still emits as a present key. Dropping
	// those keys keeps them out of the request body entirely, so the server sees a field the user
	// left alone as absent rather than as an explicit empty value.
	return z.object(shape).transform(omitUndefined);
}

function omitUndefined(parsed: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	Object.entries(parsed).forEach(([key, value]) => {
		if (value !== undefined) {
			result[key] = value;
		}
	});
	return result;
}


function buildFieldSchema(fieldDef: ModelSchemaField): z.ZodTypeAny {
	const isRequired = fieldDef.is_required_for_create || fieldDef.is_required_for_update;
	let fieldSchema = createBaseFieldSchema(fieldDef);
	const hasDefaultValue = fieldDef.default_value != null;
	const shouldBeOptional = !isRequired || fieldDef.is_auto_generated || hasDefaultValue;

	if (Array.isArray(fieldDef.rules) && fieldDef.rules.length >= 2) {
		fieldSchema = applyFieldRule(fieldSchema, fieldDef.rules as ModelSchemaFieldRule);
	}

	if (shouldBeOptional) {
		return applyOptionalRule(fieldSchema);
	}

	return applyRequiredRule(fieldSchema);
}

function createBaseFieldSchema(fieldDef: ModelSchemaField): z.ZodTypeAny {
	const dataType = extractFieldDataType(fieldDef);
	return createSchemaByDataType(dataType);
}

function createSchemaByDataType(dataType: ModelSchemaFieldDataType): z.ZodTypeAny {
	const simpleSchema = createSimpleSchemaByDataType(dataType);
	if (simpleSchema) {
		return simpleSchema;
	}
	switch (dataType.name) {
		case 'model':
			return dataType.is_array ? z.array(z.any()) : z.any();
		case 'nikkiDateTime':
			return createDateTimeSchema();
		case 'nikkiLangJson':
			return z.record(createStringSchema(), createStringSchema()).or(
				z.record(z.string(), z.string()),
			);
		case 'enumString':
			return createEnumStringSchema(dataType.options);
		case 'jsonmap':
			return z.record(z.string(), z.any()).or(z.array(z.any()));
		case 'string':
		default:
			return applyStringLengthOptions(createStringSchema(), dataType.options);
	}
}

function createSimpleSchemaByDataType(dataType: ModelSchemaFieldDataType): z.ZodTypeAny | null {
	const numberSchema = createNumberLikeSchema(dataType);
	if (numberSchema) {
		return numberSchema;
	}
	switch (dataType.name) {
		case 'boolean':
			return z.boolean({ error: ErrorKeys.invalidDataType });
		case 'email':
			return applyLengthOptions(
				createStringSchema().email(ErrorKeys.invalidEmail),
				dataType.options,
				ErrorKeys.invalidStringLength,
			);
		case 'nikkiDate':
			return createStringSchema().regex(/^\d{4}-\d{2}-\d{2}$/, ErrorKeys.formatMismatch);
		case 'nikkiTime':
			return createStringSchema().regex(/^\d{2}:\d{2}:\d{2}$/, ErrorKeys.formatMismatch);
		case 'nikkiEtag':
			return applyStringLengthOptions(createStringSchema(), dataType.options);
		case 'nikkiLangCode':
			return createStringSchema().regex(/^[a-z]{2,3}-[A-Z]{2}$/, ErrorKeys.formatMismatch);
		case 'nikkiSlug':
			return applyStringLengthOptions(
				createStringSchema().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, ErrorKeys.invalidDataType),
				dataType.options,
			);
		case 'phone':
			return createStringSchema();
		case 'secret':
			return applyStringLengthOptions(createStringSchema(), dataType.options);
		case 'ulid':
			return createStringSchema().regex(/^[0-7][0-9A-Z]{25}$/, ErrorKeys.invalidDataType);
		case 'uuid':
			return createStringSchema().uuid(ErrorKeys.invalidDataType);
		case 'url':
			return applyLengthOptions(
				createStringSchema().url(ErrorKeys.invalidUrl),
				dataType.options,
				ErrorKeys.invalidStringLength,
			);
		default:
			return null;
	}
}

function createNumberLikeSchema(dataType: ModelSchemaFieldDataType): z.ZodTypeAny | null {
	switch (dataType.name) {
		case 'enumInt32':
		case 'int32':
			return acceptNumericString(applyNumericRangeOptions(
				createNumberSchema().int(ErrorKeys.invalidDataType),
				dataType.options,
			));
		case 'int64':
		case 'decimal':
			return acceptNumericString(
				applyNumericRangeOptions(createNumberSchema(), dataType.options),
			);
		default:
			return null;
	}
}

/**
 * Lets a numeric field accept the string form the API sends.
 *
 * `decimal` and `int64` cross the wire as strings on purpose — both can hold values a JS `number`
 * would round — so a record loaded for editing arrives with `"10.792338"` where the schema expects
 * `10.792338`. Validating that as-is fails every save on any record carrying one, which is what
 * kept the kiosk detail page from saving at all.
 *
 * Only strings that are entirely a number convert; anything else is left alone so the underlying
 * schema still reports `invalidDataType` rather than silently turning junk into `NaN`.
 */
function acceptNumericString(schema: z.ZodTypeAny): z.ZodTypeAny {
	return z.preprocess(
		value => (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))
			? Number(value)
			: value),
		schema,
	);
}

function applyFieldRule(fieldSchema: z.ZodTypeAny, fieldRule: ModelSchemaFieldRule): z.ZodTypeAny {
	const [ruleName, ruleArgs] = fieldRule;
	if (ruleName !== 'arrlength') {
		return fieldSchema;
	}

	if (!(fieldSchema instanceof z.ZodArray) || !Array.isArray(ruleArgs)) {
		return fieldSchema;
	}

	const [minValue, maxValue] = ruleArgs;
	let updatedSchema = fieldSchema;

	if (typeof minValue === 'number') {
		updatedSchema = updatedSchema.min(minValue, ErrorKeys.invalidArrayLength);
	}
	if (typeof maxValue === 'number') {
		updatedSchema = updatedSchema.max(maxValue, ErrorKeys.invalidArrayLength);
	}

	return updatedSchema;
}

function extractFieldDataType(fieldDef: ModelSchemaField): ModelSchemaFieldDataType {
	if (typeof fieldDef.data_type === 'string') {
		return { name: fieldDef.data_type };
	}
	return fieldDef.data_type;
}

function createEnumStringSchema(options: ModelSchemaFieldDataType['options'] | undefined): z.ZodTypeAny {
	const enumValues = options?.enumValues;
	if (!Array.isArray(enumValues) || enumValues.length === 0) {
		return createStringSchema();
	}

	const normalizedValues = enumValues.filter((value): value is string => typeof value === 'string');
	if (normalizedValues.length === 0) {
		return createStringSchema();
	}

	return createStringSchema().refine((value) => normalizedValues.includes(value), {
		message: ErrorKeys.notOneOf,
	});
}

function applyStringLengthOptions(schema: z.ZodString, options?: ModelSchemaFieldDataType['options']): z.ZodString {
	return applyLengthOptions(schema, options);
}

function applyLengthOptions<T extends z.ZodTypeAny>(
	schema: T,
	options: ModelSchemaFieldDataType['options'] | undefined,
	message: string = ErrorKeys.invalidStringLength,
): T {
	const rawLength = options?.length;
	if (!Array.isArray(rawLength)) {
		return schema;
	}

	const [minValue, maxValue] = rawLength;
	let nextSchema = schema;
	const schemaWithLength = nextSchema as T & {
		min?: (value: number, msg?: string) => T,
		max?: (value: number, msg?: string) => T,
	};
	if (typeof minValue === 'number' && schemaWithLength.min) {
		nextSchema = schemaWithLength.min(minValue, message);
	}
	if (typeof maxValue === 'number' && schemaWithLength.max) {
		nextSchema = schemaWithLength.max(maxValue, message);
	}
	return nextSchema;
}

function applyNumericRangeOptions(
	schema: z.ZodNumber,
	options?: ModelSchemaFieldDataType['options'],
): z.ZodNumber {
	const rawRange = options?.range;
	if (!Array.isArray(rawRange)) {
		return schema;
	}
	const [minValue, maxValue] = rawRange;
	let nextSchema = schema;
	if (typeof minValue === 'number') {
		nextSchema = nextSchema.min(minValue, ErrorKeys.invalidNumberRange);
	}
	if (typeof maxValue === 'number') {
		nextSchema = nextSchema.max(maxValue, ErrorKeys.invalidNumberRange);
	}
	return nextSchema;
}

function createStringSchema(): z.ZodString {
	return z.string({ error: ErrorKeys.invalidDataType });
}

function createNumberSchema(): z.ZodNumber {
	return z.number({ error: ErrorKeys.invalidDataType });
}

function createDateTimeSchema(): z.ZodTypeAny {
	const stringSchema = createStringSchema().datetime(ErrorKeys.formatMismatch);
	const dateSchema = z.date({ error: ErrorKeys.invalidDataType });
	return stringSchema.or(dateSchema);
}

/**
 * Validates an optional field, treating blank input as "not provided".
 *
 * An untouched text input submits `''`, and a cleared select `null`. Neither is a value the field's
 * own schema would accept — an empty string is not a ULID — so validating them directly reports a
 * spurious "invalid data type" on a field the user was free to leave alone. Blanking them to
 * `undefined` also drops the key from the parsed output, so the payload carries no property at all
 * rather than an empty one the server would have to interpret.
 */
function applyOptionalRule(fieldSchema: z.ZodTypeAny): z.ZodTypeAny {
	return z.preprocess(value => (isBlank(value) ? undefined : value), fieldSchema.optional());
}

/**
 * Whether a submitted value means "the user entered nothing".
 *
 * Deliberately narrower than {@link isNilOrEmpty}: `0` and `false` are real values a number or
 * checkbox field may legitimately hold, and must not be blanked away.
 */
function isBlank(value: unknown): boolean {
	if (value == null) {
		return true;
	}
	if (typeof value === 'string') {
		return value.trim().length === 0;
	}
	return Array.isArray(value) && value.length === 0;
}

function applyRequiredRule(fieldSchema: z.ZodTypeAny): z.ZodTypeAny {
	return z.any().refine((value) => !isNilOrEmpty(value), ErrorKeys.missingRequiredField).pipe(fieldSchema);
}

function isNilOrEmpty(value: unknown): boolean {
	if (value == null) {
		return true;
	}
	if (typeof value === 'string') {
		return value.trim().length === 0;
	}
	if (typeof value === 'number') {
		return value === 0;
	}
	if (Array.isArray(value)) {
		return value.length === 0;
	}
	return false;
}
