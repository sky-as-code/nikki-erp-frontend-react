import { ActionIcon, Badge, Card, Group, ScrollArea, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash, IconCalendarEvent } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Event } from '../../types';


export interface EventKanbanViewProps {
	events: Event[];
	isLoading?: boolean;
	onViewDetail: (eventId: string) => void;
	onEdit?: (eventId: string) => void;
	onDelete?: (eventId: string) => void;
}

export const EventKanbanView: React.FC<EventKanbanViewProps> = ({
	events,
	isLoading = false,
	onViewDetail,
	onEdit,
	onDelete,
}) => {
	const { t: translate } = useTranslation();

	const getStatusBadge = (status: 'active' | 'inactive' | 'completed') => {
		const statusMap = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
			completed: { color: 'blue', label: translate('nikki.vendingMachine.events.status.completed') },
		};
		const statusInfo = statusMap[status];
		return <Badge color={statusInfo.color} size='sm'>{statusInfo.label}</Badge>;
	};

	const getStatusLabel = (status: 'active' | 'inactive' | 'completed') => {
		const statusMap = {
			active: translate('nikki.general.status.active'),
			inactive: translate('nikki.general.status.inactive'),
			completed: translate('nikki.vendingMachine.events.status.completed'),
		};
		return statusMap[status];
	};

	// Group events by status
	const eventsByStatus = useMemo(() => {
		const grouped: Record<string, Event[]> = {
			active: [],
			inactive: [],
			completed: [],
		};

		events.forEach((event) => {
			if (grouped[event.status]) {
				grouped[event.status].push(event);
			}
		});

		return grouped;
	}, [events]);

	const statusOrder: Array<'active' | 'inactive' | 'completed'> = ['active', 'inactive', 'completed'];

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	return (
		<Group align='flex-start' gap='md' style={{ width: '100%', overflowX: 'auto' }}>
			{statusOrder.map((status) => (
				<Stack key={status} gap='sm' style={{ minWidth: 300, flex: 1 }}>
					<Group justify='space-between' align='center' p='xs' style={{ borderBottom: '2px solid' }}>
						<Text fw={600} size='md'>{getStatusLabel(status)}</Text>
						<Badge size='sm' variant='light'>{eventsByStatus[status]?.length || 0}</Badge>
					</Group>
					<ScrollArea h='calc(100vh - 300px)' type='auto'>
						<Stack gap='sm'>
							{eventsByStatus[status]?.map((event) => (
								<Card
									key={event.id}
									shadow='sm'
									padding='md'
									radius='md'
									withBorder
									style={{
										cursor: 'pointer',
									}}
									onClick={() => onViewDetail(event.id)}
								>
									<Stack gap='xs'>
										<Group justify='space-between' align='flex-start'>
											<Group gap='xs' wrap='nowrap'>
												<IconCalendarEvent size={16} />
												<Stack gap={0} style={{ flex: 1 }}>
													<Text fw={600} size='sm' lineClamp={1}>{event.code}</Text>
													<Text size='xs' c='dimmed' lineClamp={1}>{event.name}</Text>
												</Stack>
											</Group>
											<Group gap='xs' onClick={(e) => e.stopPropagation()}>
												{onEdit && (
													<Tooltip label={translate('nikki.general.actions.edit')}>
														<ActionIcon variant='subtle' color='gray' size='sm' onClick={() => onEdit(event.id)}>
															<IconEdit size={14} />
														</ActionIcon>
													</Tooltip>
												)}
												{onDelete && (
													<Tooltip label={translate('nikki.general.actions.delete')}>
														<ActionIcon variant='subtle' color='red' size='sm' onClick={() => onDelete(event.id)}>
															<IconTrash size={14} />
														</ActionIcon>
													</Tooltip>
												)}
											</Group>
										</Group>

										{event.description && (
											<Text size='xs' c='dimmed' lineClamp={2}>
												{event.description}
											</Text>
										)}

										<Group gap='xs' wrap='nowrap'>
											{getStatusBadge(event.status)}
										</Group>

										<Stack gap={2}>
											<Text size='xs' c='dimmed'>
												{translate('nikki.vendingMachine.events.fields.startDate')}: {new Date(event.startDate).toLocaleDateString()}
											</Text>
											<Text size='xs' c='dimmed'>
												{translate('nikki.vendingMachine.events.fields.endDate')}: {new Date(event.endDate).toLocaleDateString()}
											</Text>
										</Stack>
									</Stack>
								</Card>
							))}
							{(!eventsByStatus[status] || eventsByStatus[status].length === 0) && (
								<Text size='sm' c='dimmed' ta='center' p='md'>
									{translate('nikki.vendingMachine.events.messages.no_events')}
								</Text>
							)}
						</Stack>
					</ScrollArea>
				</Stack>
			))}
		</Group>
	);
};
