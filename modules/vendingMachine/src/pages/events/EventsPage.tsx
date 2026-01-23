import { Paper, Stack, Title } from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ListActions } from '@/components';
import { EventDetailDrawer, EventTable, eventSchema, useEventDetail, useEventList } from '@/features/events';
import { Event } from '@/features/events/types';


// eslint-disable-next-line max-lines-per-function
export const EventsPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { events, isLoadingList, handleRefresh } = useEventList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<Event>();

	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
	const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { event: selectedEvent, isLoading: isLoadingDetail } = useEventDetail(selectedEventId);

	React.useEffect(() => {
		document.title = translate('nikki.vendingMachine.menu.events');
	}, [translate]);

	// Filter and search events
	const filteredEvents = useMemo(() => {
		let filtered = events || [];

		// Filter by status
		if (statusFilter !== 'all') {
			filtered = filtered.filter((event: Event) => event.status === statusFilter);
		}

		// Search by code or name
		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(event: Event) =>
					event.code.toLowerCase().includes(searchLower) ||
					event.name.toLowerCase().includes(searchLower),
			) as Event[];
		}

		return filtered;
	}, [events, statusFilter, searchValue]);

	const handleViewDetail = (eventId: string) => {
		setSelectedEventId(eventId);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedEventId(undefined);
	};

	const handleOpenDeleteModal = (eventId: string) => {
		const event = events.find((e: Event) => e.id === eventId);
		if (event) {
			configOpenModal(event);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) {
			// TODO: Implement delete
			console.log('Delete event:', item.id);
		}
		handleCloseModal();
	};

	const handleCreate = () => {
		// TODO: Navigate to create page
		console.log('Create event');
	};

	const statusOptions = [
		{ value: 'all', label: translate('nikki.general.filters.all') },
		{ value: 'active', label: translate('nikki.general.status.active') },
		{ value: 'inactive', label: translate('nikki.general.status.inactive') },
		{ value: 'completed', label: translate('nikki.vendingMachine.events.status.completed') },
	];

	return (
		<>
			<Stack gap='md'>
				<Title order={5} mt='md'>{translate('nikki.vendingMachine.menu.events')}</Title>
				<ListActions
					onCreate={handleCreate}
					onRefresh={handleRefresh}
					searchValue={searchValue}
					onSearchChange={setSearchValue}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
					statusOptions={statusOptions}
					searchPlaceholder={translate('nikki.vendingMachine.events.search.placeholder')}
					filterPlaceholder={translate('nikki.vendingMachine.events.filter.status')}
				/>
				<Paper className='p-4'>
					<EventTable
						columns={['code', 'name', 'description', 'status', 'startDate', 'endDate', 'actions']}
						data={filteredEvents as unknown as Record<string, unknown>[]}
						schema={eventSchema as ModelSchema}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				</Paper>

				<ConfirmModal
					opened={isOpen}
					onClose={handleCloseModal}
					onConfirm={handleDeleteConfirm}
					title={translate('nikki.general.messages.delete_confirm')}
					message={
						item
							? translate('nikki.general.messages.delete_confirm_name', { name: item.name })
							: translate('nikki.general.messages.delete_confirm')
					}
					confirmLabel={translate('nikki.general.actions.delete')}
					confirmColor='red'
				/>
			</Stack>

			<EventDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				event={selectedEvent}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};

