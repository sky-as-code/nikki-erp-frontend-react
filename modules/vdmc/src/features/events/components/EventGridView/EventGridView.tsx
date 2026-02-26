import { ActionIcon, Badge, Card, Group, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash, IconCalendarEvent } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Event } from '../../types';


export interface EventGridViewProps {
	events: Event[];
	isLoading?: boolean;
	onViewDetail: (eventId: string) => void;
	onEdit?: (eventId: string) => void;
	onDelete?: (eventId: string) => void;
}

export const EventGridView: React.FC<EventGridViewProps> = ({
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

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (events.length === 0) {
		return <Text c='dimmed'>{translate('nikki.vendingMachine.events.messages.no_events')}</Text>;
	}

	return (
		<SimpleGrid
			cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
			spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
		>
			{events.map((event) => (
				<Card
					key={event.id}
					shadow='sm'
					padding='lg'
					radius='md'
					withBorder
					style={{
						cursor: 'pointer',
					}}
					onClick={() => onViewDetail(event.id)}
				>
					<Stack gap='sm'>
						<Group justify='space-between' align='flex-start'>
							<Group gap='xs'>
								<IconCalendarEvent size={20} />
								<Stack gap={0}>
									<Text fw={600} size='sm'>{event.code}</Text>
									<Text size='xs' c='dimmed'>{event.name}</Text>
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
							<Text size='xs' c='dimmed' lineClamp={3}>
								{event.description}
							</Text>
						)}

						<Group gap='xs' wrap='nowrap'>
							{getStatusBadge(event.status)}
						</Group>

						<Stack gap={4}>
							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.events.fields.startDate')}: {new Date(event.startDate).toLocaleDateString()}
							</Text>
							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.events.fields.endDate')}: {new Date(event.endDate).toLocaleDateString()}
							</Text>
						</Stack>

						<Text size='xs' c='dimmed'>
							{translate('nikki.vendingMachine.events.fields.createdAt')}: {new Date(event.createdAt).toLocaleDateString()}
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};
