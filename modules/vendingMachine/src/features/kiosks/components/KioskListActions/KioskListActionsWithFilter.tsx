import { Button, Group, SegmentedControl, Center } from '@mantine/core';
import { IconPlus, IconRefresh, IconList, IconLayoutGrid, IconMapPin } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { FilterGroup, SearchGraph, useFilterState } from '@/components/FilterGroup';

import { kioskFilterConfig } from './filterConfig';

import type { ViewMode } from './KioskListActions';


export interface KioskListActionsWithFilterProps {
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
	onCreate: () => void;
	onRefresh: () => void;
	onSearchGraphChange?: (graph: SearchGraph) => void;
}


export const KioskListActionsWithFilter: React.FC<KioskListActionsWithFilterProps> = ({
	viewMode,
	onViewModeChange,
	onCreate,
	onRefresh,
	onSearchGraphChange,
}) => {
	const { t: translate } = useTranslation();
	const { state, updateState, resetState } = useFilterState({
		config: kioskFilterConfig,
		onSearchGraphChange,
	});

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
				<FilterGroup
					config={kioskFilterConfig}
					state={state}
					updateState={updateState}
					resetState={resetState}
					placeholder={translate('nikki.vendingMachine.kiosk.search.placeholder')}
				/>

				<KioskSegmentedControl
					viewMode={viewMode}
					onViewModeChange={onViewModeChange}
				/>
			</Group>
		</Group>
	);
};


const KioskSegmentedControl: React.FC<{
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
}> = ({ viewMode, onViewModeChange }) => {
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

	return (
		<SegmentedControl
			data={viewModeSegments}
			value={viewMode}
			onChange={(value) => onViewModeChange(value as ViewMode)}
			size='md'
		/>
	);
};
