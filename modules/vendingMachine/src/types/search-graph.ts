// const (
// 	Equals        Operator = "="
// 	NotEquals     Operator = "!="
// 	GreaterThan   Operator = ">"
// 	GreaterEqual  Operator = ">="
// 	LessThan      Operator = "<"
// 	LessEqual     Operator = "<="
// 	Contains      Operator = "*"
// 	NotContains   Operator = "!*"
// 	StartsWith    Operator = "^"
// 	NotStartsWith Operator = "!^"
// 	EndsWith      Operator = "$"
// 	NotEndsWith   Operator = "!$"
// 	In            Operator = "in"
// 	NotIn         Operator = "not_in"
// 	IsSet         Operator = "is_set"
// 	IsNotSet      Operator = "not_set"
// )
/**
 * SearchGraph types for backend API
 */
export enum SearchOperator {
	EQUAL = '=',
	NOT_EQUAL = '!=',
	GREATER_THAN = '>',
	GREATER_THAN_OR_EQUAL = '>=',
	LESS_THAN = '<',
	LESS_THAN_OR_EQUAL = '<=',
	CONTAINS = '*',
	NOT_CONTAINS = '!*',
	STARTS_WITH = '^',
	NOT_STARTS_WITH = '!^',
	ENDS_WITH = '$',
	NOT_ENDS_WITH = '!$',
	IN = 'in',
	NOT_IN = 'not_in',
	IS_SET = 'is_set',
	IS_NOT_SET = 'not_set',
};

export interface SearchNode {
	if?: [string, SearchOperator, string | number | boolean | string[] | number[] | boolean[]];
	and?: SearchNode[];
	or?: SearchNode[];
}

export enum SortDirection {
	ASC = 'asc',
	DESC = 'desc',
};
export type SearchOrder = [string, SortDirection];

export interface SearchGraph {
	if?: SearchNode['if'];
	and?: SearchNode[];
	or?: SearchNode[];
	order?: SearchOrder[];
	groupBy?: string[];
}
