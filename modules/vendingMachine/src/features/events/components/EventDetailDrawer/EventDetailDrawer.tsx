import { Badge, Divider, Drawer, Group, Stack, Text, Title } from '@mantine/core';
import { IconCalendarEvent } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Event } from '../../types';


export interface EventDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	event: Event | undefined;
	isLoading?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
	opened,
	onClose,
	event,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();

	if (isLoading || !event) {
		return (
			<Drawer
				opened={opened}
				onClose={onClose}
				position='right'
				size='md'
				title={<Title order={4}>{translate('nikki.vendingMachine.events.detail.title')}</Title>}
			>
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</Drawer>
		);
	}

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
			completed: { color: 'blue', label: translate('nikki.vendingMachine.events.status.completed') },
		};
		const statusInfo = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position='right'
			size='md'
			title={
				<Group gap='xs'>
					<IconCalendarEvent size={20} />
					<Title order={4}>{event.name}</Title>
				</Group>
			}
			overlayProps={{ opacity: 0.5, blur: 4 }}
		>
			<Stack gap='md'>
				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.events.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{event.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.events.fields.name')}
					</Text>
					<Text size='sm'>{event.name}</Text>
				</div>

				{event.description && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.events.fields.description')}
							</Text>
							<Text size='sm'>{event.description}</Text>
						</div>
					</>
				)}

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.events.fields.status')}
					</Text>
					{getStatusBadge(event.status)}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.events.fields.startDate')}
					</Text>
					<Text size='sm'>{new Date(event.startDate).toLocaleString()}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.events.fields.endDate')}
					</Text>
					<Text size='sm'>{new Date(event.endDate).toLocaleString()}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.events.fields.createdAt')}
					</Text>
					<Text size='sm'>{new Date(event.createdAt).toLocaleString()}</Text>
				</div>
			</Stack>
		</Drawer>
	);
};

