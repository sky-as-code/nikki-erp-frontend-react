import { Group } from '@mantine/core';
import React from 'react';

import { ControlPanelAction, type ControlPanelActionItem } from './ControlPanelAction';
import { ControlPanelFilter } from './ControlPanelFilter';
import { ControlPanelViewMode, ControlPanelViewModeProps } from './ControlPanelViewMode';

import type { ControlPanelFilterConfig } from './types';


export type { ViewMode, ControlPanelFilterConfig } from './types';

export interface ControlPanelProps {
	actions?: ControlPanelActionItem[];
	viewMode?: ControlPanelViewModeProps;
	//
	filters?: ControlPanelFilterConfig[];
	search?: {
		value?: string;
		onChange?: (value: string) => void;
		placeholder?: string;
	};
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
	actions = [],
	filters = [],
	search,
	viewMode,
}) => {
	return (
		<Group justify='space-between' align='flex-end' wrap='wrap'>
			<ControlPanelAction actions={actions} />
			<Group gap='md' wrap='wrap' align='flex-end'>
				{(filters.length || search) && <ControlPanelFilter filters={filters} search={search} />}
				{viewMode && viewMode.segments.length > 1 && <ControlPanelViewMode {...viewMode} />}
			</Group>
		</Group>
	);
};
