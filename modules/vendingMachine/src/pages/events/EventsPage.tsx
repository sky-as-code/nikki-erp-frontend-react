import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal, useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionBar, type ViewMode, ActionBarFilterConfig } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import { EventDetailDrawer, EventGridView, EventTable, EventKanbanView, EventGanttView, EventCalendarView, eventSchema, useEventDetail, useEventList } from '@/features/events';
import { Event } from '@/features/events/types';


// eslint-disable-next-line max-lines-per-function
export const EventsPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { events, isLoadingList, handleRefresh } = useEventList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<Event>();

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { event: selectedEvent, isLoading: isLoadingDetail } = useEventDetail(selectedEventId);

	useDocumentTitle('nikki.vendingMachine.menu.events');

	// Filter and search events
	const filteredEvents = useMemo(() => {
		let filtered = events || [];

		// Filter by status
		if (statusFilter.length > 0) {
			filtered = filtered.filter((event: Event) => statusFilter.includes(event.status));
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
		{ value: 'active', label: translate('nikki.general.status.active') },
		{ value: 'inactive', label: translate('nikki.general.status.inactive') },
		{ value: 'completed', label: translate('nikki.vendingMachine.events.status.completed') },
	];

	const filters: ActionBarFilterConfig[] = useMemo(() => [
		{
			value: statusFilter,
			onChange: setStatusFilter,
			options: statusOptions,
			placeholder: translate('nikki.vendingMachine.events.filter.status'),
		},
	], [statusFilter, statusOptions, translate]);

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.menu.events'), href: '#' },
	], [translate]);

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={
					<ActionBar
						onCreate={handleCreate}
						onRefresh={handleRefresh}
						searchValue={searchValue}
						onSearchChange={setSearchValue}
						filters={filters}
						searchPlaceholder={translate('nikki.vendingMachine.events.search.placeholder')}
						viewMode={viewMode}
						onViewModeChange={setViewMode}
						viewModeSegments={['list', 'grid', 'kanban', 'gantt', 'calendar']}
					/>
				}
			>
				{viewMode === 'list' ? (
					<EventTable
						columns={['code', 'name', 'description', 'status', 'startDate', 'endDate', 'actions']}
						data={filteredEvents as unknown as Record<string, unknown>[]}
						schema={eventSchema as ModelSchema}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : viewMode === 'grid' ? (
					<EventGridView
						events={filteredEvents}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : viewMode === 'kanban' ? (
					<EventKanbanView
						events={filteredEvents}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : viewMode === 'gantt' ? (
					<EventGanttView
						events={filteredEvents}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : (
					<EventCalendarView
						events={filteredEvents}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				)}
			</PageContainer>

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

			<EventDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				event={selectedEvent}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};

