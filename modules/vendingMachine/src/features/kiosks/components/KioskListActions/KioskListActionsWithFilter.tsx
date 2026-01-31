import { Button, Group, SegmentedControl, Center } from '@mantine/core';
import { IconPlus, IconRefresh, IconList, IconLayoutGrid, IconMapPin } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterGroup, useFilterState } from '@/components/FilterGroup';

import { kioskFilterConfig } from '../../config/filterConfig';

import type { ViewMode } from './KioskListActions';



export interface KioskListActionsWithFilterProps {
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
	onCreate: () => void;
	onRefresh: () => void;
	onSearchGraphChange?: (graph: any) => void;
}

// eslint-disable-next-line max-lines-per-function
export const KioskListActionsWithFilter: React.FC<KioskListActionsWithFilterProps> = ({
	viewMode,
	onViewModeChange,
	onCreate,
	onRefresh,
	onSearchGraphChange,
}) => {
	const { t: translate } = useTranslation();
	const { state, updateState, resetState } = useFilterState({
		onSearchGraphChange,
	});

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

	const hasActiveFilters = useMemo(() => {
		return (
			state.search.length > 0 ||
			state.filter.length > 0 ||
			state.groupBy.length > 0 ||
			state.sort.length > 0
		);
	}, [state]);

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
						onClick={resetState}
					>
						{translate('nikki.general.actions.clear_filters')}
					</Button>
				)}
				<FilterGroup
					config={kioskFilterConfig}
					state={state}
					updateState={updateState}
					resetState={resetState}
					placeholder={translate('nikki.vendingMachine.kiosk.search.placeholder')}
				/>

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
