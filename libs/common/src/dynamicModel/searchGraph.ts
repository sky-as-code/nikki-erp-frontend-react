/**
 * A single condition, as the positional tuple the backend expects.
 * The operator may take more than one value, hence the rest element.
 */
export type SearchCondition = [string, SearchOperator, ...unknown[]]; // i.e: ['field1', '=', 'value1']

/**
 * `if`, `and`, `or` are mutually exclusive.
 * The key is `if`, not `condition`: it must match the backend's JSON tag.
 */
export type SearchGraph = {
	if?: SearchCondition,
	and?: SearchNode[],
	or?: SearchNode[],
	order?: OrderBy, // i.e: [['field1', 'asc'], ['field2', 'desc']]
};

export type OrderBy = Array<[string, SearchOrder]>;

/**
 * `if`, `and`, `or` are mutually exclusive.
 */
export type SearchNode = {
	if?: SearchCondition,
	and?: SearchNode[],
	or?: SearchNode[],
};

export type SearchOperator =
	'='      // Equals
	| '!='   // NotEquals
	| '>'    // GreaterThan
	| '>='   // GreaterEqual
	| '<'    // LessThan
	| '<='   // LessEqual
	| '*'    // Contains
	| '!*'   // NotContains
	| '^'    // StartsWith
	| '!^'   // NotStartsWith
	| '$'    // EndsWith
	| '!$'   // NotEndsWith
	| 'in'   // In
	| 'not_in' // NotIn
	| 'is_set' // IsSet
	| 'not_set' // IsNotSet
	// Linked / NotLinked: only for graph conditions on a many edge (one:many, many:many).
	// Field is the edge name (no dot). Value is the peer / child row primary key to test linkage.
	| 'linked'
	| 'not_linked';

export type SearchOrder = 'asc' | 'desc';
