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
	is_required_for_create?: boolean,
	is_required_for_update?: boolean,
	is_primary_key?: boolean,
	is_system_field?: boolean,
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

// Extra validation rule for the field. <br/>
// Format: [rule_name, rule_args] <br/>
// rule_name: The name of the rule. <br/>
// rule_args: has different formats depending on the rule. <br/>
// Example: ['arrlength', [0, 100]] means the array length must be between 0 and 100.
export type ModelSchemaFieldRule = [string, unknown];

export function buildValidationSchema(modelSchema: ModelSchema): z.ZodObject<any> {
	const shape: Record<string, z.ZodTypeAny> = {};
	Object.entries(modelSchema.fields).forEach(([fieldName, fieldDef]) => {
		shape[fieldName] = buildFieldSchema(fieldDef);
	});
	return z.object(shape);
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
		return fieldSchema.optional();
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
			return applyNumericRangeOptions(
				createNumberSchema().int(ErrorKeys.invalidDataType),
				dataType.options,
			);
		case 'int64':
		case 'decimal':
			return applyNumericRangeOptions(createNumberSchema(), dataType.options);
		default:
			return null;
	}
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
