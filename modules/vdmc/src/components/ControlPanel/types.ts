export type ViewMode = 'list' | 'grid' | 'kanban' | 'gantt' | 'calendar' | 'map';

export interface ControlPanelFilterConfig {
	value: string[];
	onChange: (value: string[]) => void;
	options: Array<{ value: string; label: string }>;
	placeholder?: string;
	maxValues?: number;
	clearable?: boolean;
	minWidth?: number;
}
