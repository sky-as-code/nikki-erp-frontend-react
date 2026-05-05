import { z } from 'zod';


export type ModelSchema = {
	name: string,
	label?: ModelSchemaLangJson,
	to_relations?: ModelSchemaRelation[],
	from_relations?: ModelSchemaRelation[],
	fields: ModelSchemaFieldsMap,
};

export type ModelSchemaField = {
	name: string,
	label?: ModelSchemaLangJson,
	data_type: ModelSchemaFieldDataType,
	description?: ModelSchemaLangJson,
	placeholder?: ModelSchemaLangJson,
	is_auto_generated?: boolean,
	is_required_for_create: boolean,
	is_required_for_update: boolean,
	is_primary_key?: boolean,
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
	let fieldSchema = createBaseFieldSchema(fieldDef);
	const hasDefaultValue = fieldDef.default_value != null;
	const isRequired = fieldDef.is_required_for_create || fieldDef.is_required_for_update;
	const shouldBeOptional = !isRequired || fieldDef.is_auto_generated || hasDefaultValue;

	if (Array.isArray(fieldDef.rules) && fieldDef.rules.length >= 2) {
		fieldSchema = applyFieldRule(fieldSchema, fieldDef.rules as ModelSchemaFieldRule);
	}

	if (shouldBeOptional) {
		return fieldSchema.optional();
	}

	return fieldSchema;
}

function createBaseFieldSchema(fieldDef: ModelSchemaField): z.ZodTypeAny {
	const dataType = extractFieldDataType(fieldDef);
	switch (dataType.name) {
		case 'boolean':
			return z.boolean();
		case 'email':
			return applyLengthOptions(z.email(), dataType.options);
		case 'model':
			return dataType.is_array ? z.array(z.any()) : z.any();
		case 'nikkiDateTime':
			return z.iso.datetime().or(z.date());
		case 'nikkiEtag':
			return applyStringLengthOptions(z.string().min(1), dataType.options);
		case 'ulid':
			return z.ulid();
		case 'url':
			return applyLengthOptions(z.url(), dataType.options);
		case 'enumString':
			return createEnumStringSchema(dataType.options);
		case 'string':
		default:
			return applyStringLengthOptions(z.string(), dataType.options);
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
		updatedSchema = updatedSchema.min(minValue);
	}
	if (typeof maxValue === 'number') {
		updatedSchema = updatedSchema.max(maxValue);
	}

	return updatedSchema;
}

function extractFieldDataType(fieldDef: ModelSchemaField): ModelSchemaFieldDataType {
	if (typeof fieldDef.data_type === 'string') {
		return { name: fieldDef.data_type };
	}
	return fieldDef.data_type;
}

function createEnumStringSchema(options?: ModelSchemaFieldDataType['options']): z.ZodTypeAny {
	const enumValues = options?.enumValues;
	if (!Array.isArray(enumValues) || enumValues.length === 0) {
		return z.string();
	}

	const normalizedValues = enumValues.filter((value): value is string => typeof value === 'string');
	if (normalizedValues.length === 0) {
		return z.string();
	}

	return z.enum(normalizedValues as [string, ...string[]]);
}

function applyStringLengthOptions(schema: z.ZodString, options?: ModelSchemaFieldDataType['options']): z.ZodString {
	return applyLengthOptions(schema, options);
}

function applyLengthOptions<T extends z.ZodTypeAny>(schema: T, options?: ModelSchemaFieldDataType['options']): T {
	const rawLength = options?.length;
	if (!Array.isArray(rawLength)) {
		return schema;
	}

	const [minValue, maxValue] = rawLength;
	let nextSchema = schema;
	const schemaWithLength = nextSchema as T & {
		min?: (value: number) => T,
		max?: (value: number) => T,
	};
	if (typeof minValue === 'number' && schemaWithLength.min) {
		nextSchema = schemaWithLength.min(minValue);
	}
	if (typeof maxValue === 'number' && schemaWithLength.max) {
		nextSchema = schemaWithLength.max(maxValue);
	}
	return nextSchema;
}
