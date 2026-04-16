import React from 'react';


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
export type SearchOperator = '^' | '!^' | '$' | '!$' | '=' | '!=' | '>' | '<' | '>=' | '<=' | '*' | '!*';
export type FilterOperator = SearchOperator | 'in' | 'not_in' | 'is_set' | 'not_set';

export interface SearchCondition {
	if: [string, SearchOperator, string | number | boolean];
}

export interface SearchNode {
	if?: [string, FilterOperator, string | number | boolean | string[] | number[] | boolean[]];
	and?: SearchNode[];
	or?: SearchNode[];
}

export interface SearchOrder {
	field: string;
	direction: 'asc' | 'desc';
}

export type SearchOrderGraph = [string, 'asc' | 'desc'];

export interface SearchGraph {
	if?: SearchCondition['if'];
	and?: SearchNode[];
	or?: SearchNode[];
	order?: SearchOrderGraph[];
	groupBy?: string[];
}

/**
 * Filter Config Types
 */
export type FilterType = 'search' | 'filter' | 'groupBy' | 'sort' | 'favorites';


export interface FilterOption {
	value: string | number | boolean;
	label: string;
	icon?: React.ReactNode;
}

export interface SearchConfig {
	key: string;
	label: string;
	placeholder?: string;
	operator?: SearchOperator;
}

/**
 * Condition structure: [operator, value]
 * - If operator is '$and' or '$or', value is an array of FilterConditionNode
 * - If operator is '=', '!=', '*', etc., value is a value or array of values
 */
export type FilterCondition =
	| ['$and' | '$or', FilterConditionNode[]]
	| [FilterOperator, any];

/**
 * Component types for filter nodes
 */
export interface FilterComponent {
	type: 'range_number' | 'range_date' | 'range_time' | 'range_datetime';
	min?: number;
	max?: number;
	step?: number;
	placeholder?: string;
}

/**
 * Range configuration for range type filters
 */
export interface RangeConfig {
	min?: number;
	max?: number;
	step?: number;
	defaultMin?: number;
	defaultMax?: number;
}

/**
 * Node trong nested condition structure, bao gồm key và condition
 */
export interface FilterConditionNode {
	key: string;
	label?: string; // Label đại diện cho key
	condition: FilterCondition;
	nodeId?: string; // ID được tạo theo path trong cây filter (key + index)
	component?: FilterComponent; // Loại component được sử dụng
}

export interface FilterConfig {
	key: string;
	label?: string;
	condition: FilterCondition;
	nodeId?: string; // ID được tạo theo path trong cây filter (key + index)
	component?: FilterComponent; // Loại component được sử dụng
}



// GroupByConfig
export interface GroupByConfig {
	key: string;
	label: string;
}

export interface SortConfig {
	key: string;
	label: string;
}

export type SortDirection = 'asc' | 'desc';

export interface FavoritesConfig {
	onSave?: (name: string, graph: SearchGraph) => void;
	onLoad?: (name: string) => SearchGraph | null;
	onDelete?: (name: string) => void;
	savedFilters?: Array<{ name: string; graph: SearchGraph }>;
}

export interface FilterGroupConfig {
	search?: SearchConfig[];
	filter?: FilterConfig | FilterConditionNode;
	groupBy?: GroupByConfig[];
	sort?: SortConfig[];
	favorites?: FavoritesConfig;
}

/**
 * Filter State Types
 */
export interface SearchValue {
	key: string;
	value: string;
	operator?: SearchOperator;
}

export interface FilterValue {
	key: string;
	label?: string;
	nodeId?: string; // ID được tạo theo path trong cây filter (key + index)
	value: any;
}

export interface FilterState {
	search: SearchValue[];
	filter: FilterValue[];
	groupBy: string[];
	sort: SearchOrder[];
}

export interface FilterTag {
	type: 'search' | 'filter' | 'groupBy' | 'sort';
	key: string;
	label: string;
	value: string | string[];
	onRemove: () => void;
}
