/**
 * SearchGraph types for backend API
 */
export type SearchOperator = '^' | '$' | '=' | '!=' | '>' | '<' | '>=' | '<=' | '~' | '!~';

export interface SearchCondition {
	if: [string, SearchOperator, string | number | boolean];
}

export interface SearchNode {
	if?: [string, SearchOperator, string | number | boolean];
	and?: SearchNode[];
	or?: SearchNode[];
}

export interface SearchOrder {
	field: string;
	direction: 'asc' | 'desc';
}

export interface SearchGraph {
	if?: SearchCondition['if'];
	and?: SearchNode[];
	or?: SearchNode[];
	order?: SearchOrder[];
	groupBy?: string[];
}

/**
 * Filter Config Types
 */
export type FilterType = 'search' | 'filter' | 'groupBy' | 'sort' | 'favorites';

import React from 'react';

export interface FilterOption {
	value: string;
	label: string;
	icon?: React.ReactNode;
}

export interface SearchConfig {
	key: string;
	label: string;
	placeholder?: string;
	operator?: SearchOperator;
}

export interface FilterConfig {
	key: string;
	label: string;
	type: 'select' | 'multiselect' | 'date' | 'daterange' | 'boolean' | 'number' | 'custom';
	options?: FilterOption[];
	operator?: SearchOperator;
	customComponent?: React.ComponentType<any>;
}

export interface GroupByConfig {
	key: string;
	label: string;
}

export interface SortConfig {
	key: string;
	label: string;
	defaultDirection?: 'asc' | 'desc';
}

export interface FavoritesConfig {
	onSave?: (name: string, graph: SearchGraph) => void;
	onLoad?: (name: string) => SearchGraph | null;
	onDelete?: (name: string) => void;
	savedFilters?: Array<{ name: string; graph: SearchGraph }>;
}

export interface FilterDropdownConfig {
	search?: SearchConfig[];
	filter?: FilterConfig[];
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
	values: (string | number | boolean)[];
	operator?: SearchOperator;
}

export interface FilterState {
	search: SearchValue[];
	filter: FilterValue[];
	groupBy: string[];
	sort: SearchOrder[];
}

export interface FilterTag {
	type: 'search' | 'filter' | 'groupBy';
	key: string;
	label: string;
	value: string | string[];
	onRemove: () => void;
}
