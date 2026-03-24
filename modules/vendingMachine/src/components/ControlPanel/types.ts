export const VIEW_MODE_SEGMENTS = {
	list: 'list',
	grid: 'grid',
	kanban: 'kanban',
	gantt: 'gantt',
	calendar: 'calendar',
	map: 'map',
} as const;

export type ViewMode = (typeof VIEW_MODE_SEGMENTS)[keyof typeof VIEW_MODE_SEGMENTS];

export interface ControlPanelFilterConfig {
	value: string[];
	onChange: (value: string[]) => void;
	options: Array<{ value: string; label: string }>;
	placeholder?: string;
	maxValues?: number;
	clearable?: boolean;
	minWidth?: number;
}
