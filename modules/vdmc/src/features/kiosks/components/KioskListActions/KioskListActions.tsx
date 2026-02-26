import { Button, Group, SegmentedControl, Select, Stack, Text, TextInput, Center } from '@mantine/core';
import { IconPlus, IconRefresh, IconList, IconLayoutGrid, IconMapPin, IconSearch, IconX } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ConnectionStatus, KioskMode, KioskStatus } from '../../types';


export type ViewMode = 'list' | 'grid' | 'map';

export interface KioskListActionsProps {
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
	onCreate: () => void;
	onRefresh: () => void;
	searchValue: string;
	onSearchChange: (value: string) => void;
	statusFilter: KioskStatus | 'all';
	onStatusFilterChange: (status: KioskStatus | 'all') => void;
	connectionFilter: ConnectionStatus | 'all';
	onConnectionFilterChange: (connection: ConnectionStatus | 'all') => void;
	modeFilter: KioskMode | 'all';
	onModeFilterChange: (mode: KioskMode | 'all') => void;
}

// eslint-disable-next-line max-lines-per-function
export const KioskListActions: React.FC<KioskListActionsProps> = ({
	viewMode,
	onViewModeChange,
	onCreate,
	onRefresh,
	searchValue,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
	connectionFilter,
	onConnectionFilterChange,
	modeFilter,
	onModeFilterChange,
}) => {
	const { t: translate } = useTranslation();

	const viewModeSegments = [
		{
			value: 'list',
			label: (
				<Center h={20}>
					<IconList size={16} />
				</Center>
			),
		},
		{
			value: 'grid',
			label: (
				<Center h={20}>
					<IconLayoutGrid size={16} />
				</Center>
			),
		},
		{
			value: 'map',
			label: (
				<Center h={20}>
					<IconMapPin size={16} />
				</Center>
			),
		},
	];

	const statusOptions = [
		{ value: 'all', label: translate('nikki.general.filters.all') },
		{ value: KioskStatus.ACTIVATED, label: translate('nikki.vendingMachine.kiosk.status.activated') },
		{ value: KioskStatus.DISABLED, label: translate('nikki.vendingMachine.kiosk.status.disabled') },
		{ value: KioskStatus.DELETED, label: translate('nikki.vendingMachine.kiosk.status.deleted') },
	];

	const connectionOptions = [
		{ value: 'all', label: translate('nikki.general.filters.all') },
		{ value: ConnectionStatus.FAST, label: translate('nikki.vendingMachine.kiosk.connectionStatus.fast') },
		{ value: ConnectionStatus.SLOW, label: translate('nikki.vendingMachine.kiosk.connectionStatus.slow') },
		{ value: ConnectionStatus.DISCONNECTED, label: translate('nikki.vendingMachine.kiosk.connectionStatus.disconnected') },
	];

	const modeOptions = [
		{ value: 'all', label: translate('nikki.general.filters.all') },
		{ value: KioskMode.PENDING, label: translate('nikki.vendingMachine.kiosk.mode.pending') },
		{ value: KioskMode.SELLING, label: translate('nikki.vendingMachine.kiosk.mode.selling') },
		{ value: KioskMode.ADSONLY, label: translate('nikki.vendingMachine.kiosk.mode.adsOnly') },
	];

	const hasActiveFilters = statusFilter !== 'all' || connectionFilter !== 'all' || modeFilter !== 'all' || searchValue.trim() !== '';

	const handleClearFilters = () => {
		onStatusFilterChange('all');
		onConnectionFilterChange('all');
		onModeFilterChange('all');
		onSearchChange('');
	};

	return (
		<Group justify='space-between' align='center' wrap='wrap'>
			<Group gap='md' wrap='wrap'>
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={onCreate}
				>
					{translate('nikki.general.actions.create')}
				</Button>
				<Button
					variant='outline'
					leftSection={<IconRefresh size={16} />}
					onClick={onRefresh}
				>
					{translate('nikki.general.actions.refresh')}
				</Button>
			</Group>

			<Group gap='md' wrap='wrap' align='flex-end'>
				{hasActiveFilters && (
					<Button
						variant='light'
						color='gray'
						leftSection={<IconX size={16} />}
						onClick={handleClearFilters}
					>
						{translate('nikki.general.actions.clear_filters')}
					</Button>
				)}
				<Stack gap={4}>
					<Text size='xs' fw={400} c='dimmed'>
						{translate('nikki.vendingMachine.kiosk.search.placeholder')}
					</Text>
					<TextInput
						placeholder={translate('nikki.vendingMachine.kiosk.search.placeholder')}
						leftSection={<IconSearch size={16} />}
						value={searchValue}
						onChange={(e) => onSearchChange(e.currentTarget.value)}
						style={{ minWidth: 250 }}
					/>
				</Stack>
				<Stack gap={4}>
					<Text size='xs' fw={400} c='dimmed'>
						{translate('nikki.vendingMachine.kiosk.filter.status')}
					</Text>
					<Select
						placeholder={translate('nikki.vendingMachine.kiosk.filter.status')}
						data={statusOptions}
						value={statusFilter}
						onChange={(value) => onStatusFilterChange((value || 'all') as KioskStatus | 'all')}
						style={{ minWidth: 150 }}
						clearable={false}
					/>
				</Stack>
				<Stack gap={4}>
					<Text size='xs' fw={400} c='dimmed'>
						{translate('nikki.vendingMachine.kiosk.filter.connection')}
					</Text>
					<Select
						placeholder={translate('nikki.vendingMachine.kiosk.filter.connection')}
						data={connectionOptions}
						value={connectionFilter}
						onChange={(value) => onConnectionFilterChange((value || 'all') as ConnectionStatus | 'all')}
						style={{ minWidth: 150 }}
						clearable={false}
					/>
				</Stack>
				<Stack gap={4}>
					<Text size='xs' fw={400} c='dimmed'>
						{translate('nikki.vendingMachine.kiosk.filter.mode')}
					</Text>
					<Select
						placeholder={translate('nikki.vendingMachine.kiosk.filter.mode')}
						data={modeOptions}
						value={modeFilter}
						onChange={(value) => onModeFilterChange((value || 'all') as KioskMode | 'all')}
						style={{ minWidth: 150 }}
						clearable={false}
					/>
				</Stack>
				<SegmentedControl
					data={viewModeSegments}
					value={viewMode}
					onChange={(value) => onViewModeChange(value as ViewMode)}
					size='md'
				/>
			</Group>
		</Group>
	);
};

