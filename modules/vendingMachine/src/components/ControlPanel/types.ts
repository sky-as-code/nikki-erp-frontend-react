import { SimpleFilter } from '@/helpers';


export const VIEW_MODE_SEGMENTS = {
	list: 'list',
	grid: 'grid',
	kanban: 'kanban',
	gantt: 'gantt',
	calendar: 'calendar',
	map: 'map',
} as const;

export type ViewMode = (typeof VIEW_MODE_SEGMENTS)[keyof typeof VIEW_MODE_SEGMENTS];

export type ControlPanelBaseFilter = {
	key: string;
	type: string;
	value: any;
	onChange: (value: any) => void;
	getGraphValue?: (value: any) => SimpleFilter['value'];
	//
	placeholder?: string;
	minWidth?: number;
};

export interface ControlPanelSearchFilter extends ControlPanelBaseFilter {
	type: 'search';
	searchFields: string[];
	clearable?: boolean;
}

export interface ControlPanelOptionFilter extends ControlPanelBaseFilter {
	type: 'select' | 'multiSelect';
	options: Array<{ value: string; label: string }>;
	maxValues?: number;
	clearable?: boolean;
}
export type ControlPanelFilterConfig =
	| ControlPanelSearchFilter
	| ControlPanelOptionFilter;

