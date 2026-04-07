export const VIEW_MODE_SEGMENTS = {
	list: 'list',
	grid: 'grid',
	kanban: 'kanban',
	gantt: 'gantt',
	calendar: 'calendar',
	map: 'map',
} as const;

export type ViewMode = (typeof VIEW_MODE_SEGMENTS)[keyof typeof VIEW_MODE_SEGMENTS];

export interface ControlPanelSearchFilter {
	key: string;
	type: 'search';
	value: string;
	onChange: (value: string) => void;
	searchFields: string[];
	placeholder?: string;
	minWidth?: number;
}

export interface ControlPanelOptionFilter {
	key: string;
	type: 'select' | 'multiSelect';
	value: string[];
	onChange: (value: string[]) => void;
	options: Array<{ value: string; label: string }>;
	placeholder?: string;
	maxValues?: number;
	clearable?: boolean;
	minWidth?: number;
}
export type ControlPanelFilterConfig = ControlPanelSearchFilter | ControlPanelOptionFilter;

