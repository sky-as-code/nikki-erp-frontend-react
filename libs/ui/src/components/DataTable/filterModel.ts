import * as dyn from '@nikkierp/common/dynamicModel';


/**
 * The kind of input a field's filter cell renders, derived from its declared data type.
 *
 * Coarser than {@link dyn.ModelSchemaFieldDataTypeName} on purpose: twenty-odd data types map
 * onto five ways of asking the user for a value. `unsupported` is not a failure — it is the
 * honest answer for a type no text box can express (a nested model, a JSON map, a masked
 * secret), and the filter row leaves those columns empty rather than offering a control that
 * cannot produce a valid condition.
 */
export type FilterInputKind =
	| 'text'
	/** Translatable text: filters through `column ->> language`, so string operators only. */
	| 'langText'
	| 'number'
	| 'boolean'
	| 'enum'
	| 'date'
	| 'unsupported';

/**
 * One condition, in the form the UI edits it.
 *
 * Deliberately not a {@link dyn.SearchCondition}: that is a positional tuple built for the
 * wire, while this carries the `key` a React list needs and keeps `values` separate so an
 * operator change does not have to re-parse the tuple.
 */
export type FilterClause = {
	/** Stable across edits, so a row's identity does not depend on its index. */
	key: string,
	field: string,
	operator: dyn.SearchOperator,
	/** Empty for `is_set` / `not_set`; more than one for `in` / `not_in`. */
	values: unknown[],
};

const TEXT_DATA_TYPES: ReadonlySet<dyn.ModelSchemaFieldDataTypeName> = new Set([
	'email', 'nikkiLangCode', 'nikkiSlug', 'phone', 'string', 'ulid', 'url', 'uuid',
]);

const NUMBER_DATA_TYPES: ReadonlySet<dyn.ModelSchemaFieldDataTypeName> = new Set([
	'decimal', 'int32', 'int64',
]);

const DATE_DATA_TYPES: ReadonlySet<dyn.ModelSchemaFieldDataTypeName> = new Set([
	'nikkiDate', 'nikkiDateTime', 'nikkiTime',
]);

/**
 * Filterable, but only by the string operators.
 *
 * The backend's `stringPredicate` special-cases `nikkiLangJson`, matching against
 * `column ->> language` with the request's language code. The comparison and collection
 * operators take a different path that compares the whole `jsonb` value, which never matches a
 * plain string — so those must not be offered, even though the column is filterable.
 */
const LANG_TEXT_DATA_TYPES: ReadonlySet<dyn.ModelSchemaFieldDataTypeName> = new Set([
	'nikkiLangJson',
]);

const ENUM_DATA_TYPES: ReadonlySet<dyn.ModelSchemaFieldDataTypeName> = new Set([
	'enumInt32', 'enumString',
]);

/**
 * Operators every kind accepts, because they test presence rather than the value.
 * `linked` / `not_linked` are absent everywhere: they only apply to a many edge, and an edge is
 * never a filterable column here.
 */
const PRESENCE_OPERATORS: readonly dyn.SearchOperator[] = ['is_set', 'not_set'];

const TEXT_OPERATORS: readonly dyn.SearchOperator[] = [
	'*', '!*', '=', '!=', '^', '!^', '$', '!$', 'in', 'not_in',
];

const COMPARISON_OPERATORS: readonly dyn.SearchOperator[] = [
	'=', '!=', '>', '>=', '<', '<=', 'in', 'not_in',
];

/** The subset of string operators that reach `stringPredicate`; no equality, no `in`. */
const LANG_TEXT_OPERATORS: readonly dyn.SearchOperator[] = [
	'*', '!*', '^', '!^', '$', '!$',
];

const CHOICE_OPERATORS: readonly dyn.SearchOperator[] = ['=', '!=', 'in', 'not_in'];

/**
 * Operator prefixes recognised in free text, longest first.
 *
 * Order is load-bearing rather than cosmetic: matching is first-wins, so `!=` must precede `!`
 * -prefixed forms and `>=` must precede `>`, or `>= 5` parses as `>` with a value of `= 5`.
 * The test locks this down.
 */
const OPERATOR_TOKENS: ReadonlyArray<readonly [string, dyn.SearchOperator]> = [
	['!=', '!='],
	['>=', '>='],
	['<=', '<='],
	['!*', '!*'],
	['!^', '!^'],
	['!$', '!$'],
	['=', '='],
	['>', '>'],
	['<', '<'],
	['*', '*'],
	['^', '^'],
	['$', '$'],
];

/** Spelled-out operators, matched case-insensitively as a whole word. */
const WORD_OPERATORS: ReadonlyArray<readonly [string, dyn.SearchOperator]> = [
	['not_in', 'not_in'],
	['not_set', 'not_set'],
	['is_set', 'is_set'],
	['in', 'in'],
];

const MULTI_VALUE_OPERATORS: ReadonlySet<dyn.SearchOperator> = new Set(['in', 'not_in']);
const NO_VALUE_OPERATORS: ReadonlySet<dyn.SearchOperator> = new Set(['is_set', 'not_set']);

/** Whether a kind is edited as free text, and so accepts `{operator} {value}` input. */
export function isTextLikeKind(kind: FilterInputKind): boolean {
	return kind === 'text' || kind === 'langText';
}

/** Whether the operator takes no operand, so the UI hides its value input. */
export function isNoValueOperator(operator: dyn.SearchOperator): boolean {
	return NO_VALUE_OPERATORS.has(operator);
}

/** Whether the operator takes a list, so the UI accepts comma-separated input. */
export function isMultiValueOperator(operator: dyn.SearchOperator): boolean {
	return MULTI_VALUE_OPERATORS.has(operator);
}

export function getFilterInputKind(field: dyn.ModelSchemaField | undefined): FilterInputKind {
	const dataTypeName = getDataTypeName(field);
	if (!dataTypeName) {
		return 'unsupported';
	}
	if (dataTypeName === 'boolean') {
		return 'boolean';
	}
	if (ENUM_DATA_TYPES.has(dataTypeName)) {
		return 'enum';
	}
	if (NUMBER_DATA_TYPES.has(dataTypeName)) {
		return 'number';
	}
	if (DATE_DATA_TYPES.has(dataTypeName)) {
		return 'date';
	}
	if (TEXT_DATA_TYPES.has(dataTypeName)) {
		return 'text';
	}
	if (LANG_TEXT_DATA_TYPES.has(dataTypeName)) {
		return 'langText';
	}
	return 'unsupported';
}

/**
 * Whether a column can be filtered on at all.
 *
 * `is_persisted` is the gate that matters: a field with no database column cannot appear in a
 * WHERE clause, so offering an input for it would build a request the server rejects. A
 * computed-but-persisted field is fine, which is why this tests the column rather than
 * `is_computed`.
 */
export function isFilterableField(field: dyn.ModelSchemaField | undefined): boolean {
	if (!field || field.is_edge_model || field.is_persisted === false) {
		return false;
	}
	return getFilterInputKind(field) !== 'unsupported';
}

/** The filterable field names of a schema, in declaration order. */
export function getFilterableFieldNames(schema: dyn.ModelSchema | undefined): string[] {
	if (!schema) {
		return [];
	}
	return Object.values(schema.fields).filter(isFilterableField).map(field => field.name);
}

/** The choices an enum field offers, as `Select` data. */
export function getEnumOptions(field: dyn.ModelSchemaField | undefined): string[] {
	const rawValues = getDataType(field)?.options?.enumValues;
	if (!Array.isArray(rawValues)) {
		return [];
	}
	return rawValues
		.filter(value => typeof value === 'string' || typeof value === 'number')
		.map(value => String(value));
}

/** The operators offered for a kind, in the order they should appear in a dropdown. */
export function getOperatorsForKind(kind: FilterInputKind): dyn.SearchOperator[] {
	switch (kind) {
		case 'text':
			return [...TEXT_OPERATORS, ...PRESENCE_OPERATORS];
		case 'langText':
			return [...LANG_TEXT_OPERATORS, ...PRESENCE_OPERATORS];
		case 'number':
		case 'date':
			return [...COMPARISON_OPERATORS, ...PRESENCE_OPERATORS];
		case 'boolean':
		case 'enum':
			return [...CHOICE_OPERATORS, ...PRESENCE_OPERATORS];
		default:
			return [...PRESENCE_OPERATORS];
	}
}

/**
 * The operator a bare value means for this kind.
 *
 * Text gets `contains`, which is what a user typing into a column filter expects. Numbers and
 * dates get equality instead: `LIKE` against a numeric or temporal column is not a meaningful
 * question, and several backends reject it outright rather than coercing.
 */
export function getDefaultOperator(kind: FilterInputKind): dyn.SearchOperator {
	return isTextLikeKind(kind) ? '*' : '=';
}

export type ParsedFilterExpression = {
	operator: dyn.SearchOperator,
	values: unknown[],
};

/**
 * Reads `{operator} {value}`, falling back to the kind's default operator for a bare value.
 *
 * Returns null for blank input, which the caller reads as "remove this clause" — distinct from
 * a clause whose value is legitimately empty, which only `is_set` / `not_set` produce.
 */
export function parseFilterExpression(
	raw: string, kind: FilterInputKind,
): ParsedFilterExpression | null {
	const trimmed = raw.trim();
	if (!trimmed) {
		return null;
	}
	const matched = matchWordOperator(trimmed) ?? matchSymbolOperator(trimmed);
	if (!matched) {
		return { operator: getDefaultOperator(kind), values: [coerceValue(trimmed, kind)] };
	}
	const { operator, rest } = matched;
	if (NO_VALUE_OPERATORS.has(operator)) {
		return { operator, values: [] };
	}
	if (!rest) {
		// An operator with nothing after it is half-typed, not a query. Treating it as a
		// filter would fire a request on every keystroke of `>= 100`.
		return null;
	}
	if (MULTI_VALUE_OPERATORS.has(operator)) {
		const values = rest.split(',').map(part => part.trim()).filter(Boolean);
		return values.length === 0 ? null : { operator, values: values.map(v => coerceValue(v, kind)) };
	}
	return { operator, values: [coerceValue(rest, kind)] };
}

/** Builds the clause a raw cell entry means, or null to clear the cell. */
export function buildClauseFromInput(
	field: string, raw: string, kind: FilterInputKind,
): FilterClause | null {
	const parsed = parseFilterExpression(raw, kind);
	if (!parsed) {
		return null;
	}
	return { key: field, field, operator: parsed.operator, values: parsed.values };
}

/** Whether a clause is complete enough to send. */
export function isCompleteClause(clause: FilterClause): boolean {
	if (!clause.field) {
		return false;
	}
	if (NO_VALUE_OPERATORS.has(clause.operator)) {
		return true;
	}
	return clause.values.length > 0 && clause.values.every(value => value !== '' && value != null);
}

/** One clause as the positional tuple the backend expects. */
export function clauseToCondition(clause: FilterClause): dyn.SearchCondition {
	return [clause.field, clause.operator, ...clause.values] as dyn.SearchCondition;
}

/**
 * Folds clauses and sort order into a single search graph.
 *
 * The one writer of `graph`. Order and conditions live in the same object, so two callers each
 * spreading the previous graph would drop the other's work; routing every change through here
 * is what stops the column filter row and the FilterBox from clobbering each other.
 *
 * Returns undefined when nothing is left to say, matching how an absent graph is encoded.
 */
export function buildSearchGraph(
	clauses: FilterClause[], orderBy: dyn.OrderBy,
): dyn.SearchGraph | undefined {
	const nodes = clauses.filter(isCompleteClause).map(clause => ({ if: clauseToCondition(clause) }));
	const graph: dyn.SearchGraph = {};
	if (nodes.length === 1) {
		// A lone condition is expressed directly; `and` of one is the same query with more
		// nesting, and the flatter form is what the backend's own examples use.
		graph.if = nodes[0].if;
	}
	else if (nodes.length > 1) {
		graph.and = nodes;
	}
	if (orderBy.length > 0) {
		graph.order = orderBy;
	}
	return graph.if || graph.and || graph.order ? graph : undefined;
}

/** Reads the sort order off a graph, ignoring malformed entries. */
export function getGraphOrder(graph: dyn.SearchGraph | undefined): dyn.OrderBy {
	const rawOrder = graph?.order;
	if (!Array.isArray(rawOrder)) {
		return [];
	}
	return rawOrder.filter(
		(item): item is [string, dyn.SearchOrder] =>
			Array.isArray(item)
			&& item.length === 2
			&& typeof item[0] === 'string'
			&& (item[1] === 'asc' || item[1] === 'desc'),
	);
}

function matchSymbolOperator(
	input: string,
): { operator: dyn.SearchOperator, rest: string } | null {
	for (const [token, operator] of OPERATOR_TOKENS) {
		if (input.startsWith(token)) {
			return { operator, rest: input.slice(token.length).trim() };
		}
	}
	return null;
}

function matchWordOperator(
	input: string,
): { operator: dyn.SearchOperator, rest: string } | null {
	const lowered = input.toLowerCase();
	for (const [token, operator] of WORD_OPERATORS) {
		if (lowered === token) {
			return { operator, rest: '' };
		}
		if (lowered.startsWith(`${token} `)) {
			return { operator, rest: input.slice(token.length).trim() };
		}
	}
	return null;
}

/**
 * Narrows a typed string to the JSON type the column holds.
 *
 * Booleans and numbers must not travel as strings: the backend compares against a typed column,
 * so `"true"` and `"5"` are type errors rather than matches. A number that will not parse is
 * left as a string so the server reports it, instead of being silently turned into NaN.
 */
function coerceValue(raw: string, kind: FilterInputKind): unknown {
	if (kind === 'boolean') {
		return raw.toLowerCase() === 'true';
	}
	if (kind === 'number') {
		const parsed = Number(raw);
		return Number.isFinite(parsed) ? parsed : raw;
	}
	return raw;
}

function getDataType(
	field: dyn.ModelSchemaField | undefined,
): dyn.ModelSchemaFieldDataType | undefined {
	if (!field || typeof field.data_type === 'string') {
		return undefined;
	}
	return field.data_type;
}

function getDataTypeName(
	field: dyn.ModelSchemaField | undefined,
): dyn.ModelSchemaFieldDataTypeName | null {
	if (!field) {
		return null;
	}
	if (typeof field.data_type === 'string') {
		return field.data_type;
	}
	return field.data_type?.name ?? null;
}
