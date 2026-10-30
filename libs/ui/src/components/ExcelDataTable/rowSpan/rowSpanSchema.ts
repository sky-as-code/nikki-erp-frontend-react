import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * The `model` field named by `rowSingleField`: its sub-row columns in `fields` (a map, as `meta/schema`
 * answers, or a list, as a model JSON declares them) and their relations in `to_relations`.
 */
export type RowSpanModelField = dyn.ModelSchemaField & {
	fields?: dyn.ModelSchemaFieldsMap | dyn.ModelSchemaField[],
	to_relations?: dyn.ModelSchemaRelation[],
};

/** What a valid `rowSpanField` + `rowSingleField` pair resolves to. */
export type RowSpanConfig = {
	spanField: string,
	singleField: string,
	/** The sub-row columns, in declaration order. */
	nestedFields: string[],
	nestedSchemaFields: dyn.ModelSchemaFieldsMap,
	nestedRelations: dyn.ModelSchemaRelation[],
};

export type RowSpanResolution = { config: RowSpanConfig | null, problems: string[] };

/**
 * Validates the pair against the schema. Neither prop is the ordinary flat table, silently; anything
 * else wrong is a problem the Provider reports in development, and the table then renders flat.
 */
export function resolveRowSpanConfig(
	modelSchema: dyn.ModelSchema | undefined, spanField: string | undefined, singleField: string | undefined,
): RowSpanResolution {
	if (!spanField && !singleField) {
		return { config: null, problems: [] };
	}
	const problems = findRowSpanProblems(modelSchema, spanField, singleField);
	if (problems.length > 0 || !modelSchema || !spanField || !singleField) {
		return { config: null, problems };
	}
	const field = modelSchema.fields[singleField] as RowSpanModelField;
	const nestedSchemaFields = nestedFieldsMap(field);
	return {
		config: {
			spanField,
			singleField,
			nestedFields: Object.keys(nestedSchemaFields),
			nestedSchemaFields,
			nestedRelations: field.to_relations ?? [],
		},
		problems: [],
	};
}

function findRowSpanProblems(
	modelSchema: dyn.ModelSchema | undefined, spanField: string | undefined, singleField: string | undefined,
): string[] {
	if (!spanField || !singleField) {
		return ['rowSpanField and rowSingleField go together'];
	}
	if (!modelSchema) {
		return ['rowSpanField needs modelSchema'];
	}
	const problems: string[] = [];
	const single = modelSchema.fields[singleField] as RowSpanModelField | undefined;
	if (single?.data_type?.name !== 'model') {
		problems.push(`rowSingleField '${singleField}' must be a field of data_type 'model'`);
	}
	if (!modelSchema.fields[spanField] || spanField === singleField) {
		problems.push(`rowSpanField '${spanField}' must be another top-level field`);
	}
	const nested = single ? nestedFieldsMap(single) : {};
	if (single && Object.keys(nested).length === 0) {
		problems.push(`rowSingleField '${singleField}' declares no fields`);
	}
	for (const [name, field] of Object.entries(nested)) {
		if (field.data_type?.name === 'model') {
			problems.push(`'${singleField}.${name}' is a model: only one nesting level is supported`);
		}
		if (name in modelSchema.fields || name === 'id' || name === 'etag') {
			problems.push(`'${singleField}.${name}' clashes with a top-level field`);
		}
	}
	return problems;
}

function nestedFieldsMap(field: RowSpanModelField): dyn.ModelSchemaFieldsMap {
	const fields = field.fields ?? {};
	if (!Array.isArray(fields)) {
		return fields;
	}
	return Object.fromEntries(fields.map(nested => [nested.name, nested]));
}

/**
 * The one schema every row form edits against: the top-level fields without `rowSingleField`, plus
 * the nested fields (neither sortable nor filterable: a search cannot reach into the model), with the
 * nested relations beside the top-level ones so a nested `ulid` renders its relation select.
 */
export function buildRowSpanFlatSchema(modelSchema: dyn.ModelSchema, config: RowSpanConfig): dyn.ModelSchema {
	const top = Object.fromEntries(Object.entries(modelSchema.fields).filter(([name]) => name !== config.singleField));
	const nested = Object.fromEntries(Object.entries(config.nestedSchemaFields).map(([name, field]) => (
		[name, { ...field, name, is_sortable: false, is_filterable: false }]
	)));
	return {
		...modelSchema,
		fields: { ...top, ...nested },
		to_relations: [...(modelSchema.to_relations ?? []), ...config.nestedRelations],
	};
}

/** `rowSingleField` replaced in place by its nested fields; appended when it is not displayed. */
export function flattenRowSpanFields(fields: string[], config: RowSpanConfig): string[] {
	const flat = fields.flatMap((field) => {
		if (field === config.singleField) return config.nestedFields;
		return config.nestedFields.includes(field) ? [] : [field];
	});
	return fields.includes(config.singleField) ? flat : [...flat, ...config.nestedFields];
}

type JsonEdge = { dest_schema: string, key_map: Record<string, string>, edge?: string };
type JsonField = Omit<dyn.ModelSchemaField, 'data_type' | 'label'> & {
	label?: dyn.ModelSchemaLangJson,
	data_type: string | dyn.ModelSchemaFieldDataType,
	fields?: JsonField[],
	edges_to?: JsonEdge[],
};

/** A table schema in the model JSON form: `fields` as a list, relations as `edges_to` with a `key_map`. */
export type RowSpanSchemaJson = { name: string, fields: JsonField[], edges_to?: JsonEdge[] };

/**
 * The model JSON form (the requirement's and the backend's authoring shape) as the `dyn.ModelSchema`
 * the table reads: a field map, string data types wrapped, and each `edges_to` entry a many:one
 * relation from its `key_map` source key. Nested `fields` / `edges_to` of a `model` field likewise.
 */
export function rowSpanSchemaFromJson(json: RowSpanSchemaJson): dyn.ModelSchema {
	return {
		name: json.name,
		fields: fieldsFromJson(json.fields),
		to_relations: relationsFromJson(json.edges_to),
	};
}

function fieldsFromJson(fields: JsonField[]): dyn.ModelSchemaFieldsMap {
	return Object.fromEntries(fields.map((field) => {
		const { fields: nested, edges_to: edges, data_type: dataType, label, ...rest } = field;
		const converted: RowSpanModelField = {
			...rest,
			label: label ?? {},
			data_type: typeof dataType === 'string' ? { name: dataType as dyn.ModelSchemaFieldDataTypeName } : dataType,
		};
		if (nested) {
			converted.fields = fieldsFromJson(nested);
			converted.to_relations = relationsFromJson(edges);
		}
		return [field.name, converted];
	}));
}

function relationsFromJson(edges: JsonEdge[] | undefined): dyn.ModelSchemaRelation[] {
	return (edges ?? []).flatMap(edge => Object.keys(edge.key_map).map(srcField => ({
		edge: edge.edge ?? srcField.replace(/_id$/, ''),
		src_field: srcField,
		dest_schema_name: edge.dest_schema,
		relation_type: 'many:one' as const,
	})));
}
