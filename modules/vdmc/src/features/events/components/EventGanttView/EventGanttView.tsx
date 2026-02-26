import { Text } from '@mantine/core';
import { Gantt, Task } from 'gantt-task-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import 'gantt-task-react/dist/index.css';

import { Event } from '../../types';


export type EventGanttViewProps = {
	events: Event[];
	isLoading?: boolean;
	onViewDetail: (eventId: string) => void;
	onEdit?: (eventId: string) => void;
	onDelete?: (eventId: string) => void;
};

export const EventGanttView: React.FC<EventGanttViewProps> = (
	{ events, isLoading, onViewDetail, onEdit: _onEdit, onDelete: _onDelete }) => {
	const { t: translate } = useTranslation();

	const tasks: Task[] = useMemo(() => {
		return events.map((event) => {
			const startDate = new Date(event.startDate);
			const endDate = new Date(event.endDate);
			const now = new Date();

			// Calculate progress based on current date
			let progress = 0;
			if (now >= startDate && now <= endDate) {
				const totalDuration = endDate.getTime() - startDate.getTime();
				const elapsed = now.getTime() - startDate.getTime();
				progress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
			}
			else if (now > endDate) {
				progress = 100;
			}

			// Determine colors based on status
			const getStatusColors = () => {
				switch (event.status) {
					case 'active':
						return { progressColor: '#51cf66', progressSelectedColor: '#40c057' };
					case 'completed':
						return { progressColor: '#339af0', progressSelectedColor: '#228be6' };
					case 'inactive':
					default:
						return { progressColor: '#868e96', progressSelectedColor: '#495057' };
				}
			};

			return {
				start: startDate,
				end: endDate,
				name: `${event.code} - ${event.name}`,
				id: event.id,
				type: 'task' as const,
				progress: progress,
				isDisabled: event.status === 'inactive',
				styles: getStatusColors(),
			};
		});
	}, [events]);

	const handleTaskClick = (task: Task) => {
		onViewDetail(task.id);
	};

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (tasks.length === 0) {
		return <Text c='dimmed' ta='center' p='md'>{translate('nikki.vendingMachine.events.messages.no_events')}</Text>;
	}

	return <Gantt tasks={tasks} onClick={handleTaskClick} />;
};