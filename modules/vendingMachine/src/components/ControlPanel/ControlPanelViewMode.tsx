import { Center, SegmentedControl } from '@mantine/core';
import { IconList, IconLayoutGrid, IconColumns, IconTimeline, IconCalendar, IconMapPin } from '@tabler/icons-react';
import React, { useMemo } from 'react';

import type { ViewMode } from './types';


export interface ControlPanelViewModeProps {
	value: ViewMode;
	onChange: (mode: ViewMode) => void;
	segments: ViewMode[];
}


const defaultSegments = [
	{
		value: 'list',
		icon: <IconList size={16} />,
	},
	{
		value: 'grid',
		icon: <IconLayoutGrid size={16} />,
	},
	{
		value: 'kanban',
		icon: <IconColumns size={16} />,
	},
	{
		value: 'gantt',
		icon: <IconTimeline size={16} />,
	},
	{
		value: 'map',
		icon: <IconMapPin size={16} />,
	},
	{
		value: 'calendar',
		icon: <IconCalendar size={16} />,
	},
];

export const ControlPanelViewMode: React.FC<ControlPanelViewModeProps> = ({
	value,
	onChange,
	segments = ['list'],
}) => {
	const filteredSegments = useMemo(() => {
		return defaultSegments.filter((segment) =>
			segments.includes(segment.value as ViewMode),
		);
	}, [segments]);

	const data = filteredSegments.map((segment) => ({
		value: segment.value,
		label: <Center h={26}>{segment.icon}</Center>,
	}));

	if (filteredSegments.length <= 1 || !onChange) {
		return null;
	}

	return (
		<SegmentedControl
			data={data}
			value={value}
			onChange={(value) => onChange(value as ViewMode)}
			size='sm'
			p={2}
		/>
	);
};
