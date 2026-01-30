import { Button, Group, SegmentedControl, Center } from '@mantine/core';
import { IconPlus, IconRefresh, IconList, IconLayoutGrid, IconMapPin } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { kioskFilterConfig } from '../../config/filterConfig';

import type { ViewMode } from './KioskListActions';

import { FilterDropdown, SearchInputWithTags, useFilterState } from '@/components/FilterDropdown';


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
	const { state, updateState, resetState, searchGraph } = useFilterState({
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

	// Generate tags from filter state
	const tags = useMemo(() => {
		const result: any[] = [];

		// Add search tags
		state.search.forEach((search) => {
			const searchConfig = kioskFilterConfig.search?.find((s) => s.key === search.key);
			result.push({
				type: 'search',
				key: search.key,
				label: searchConfig?.label || search.key,
				value: search.value,
				onRemove: () => {
					const newSearch = state.search.filter((s) => s.key !== search.key);
					updateState({ search: newSearch });
				},
			});
		});

		// Add filter tags
		state.filter.forEach((filter) => {
			const filterConfig = kioskFilterConfig.filter?.find((f) => f.key === filter.key);
			result.push({
				type: 'filter',
				key: filter.key,
				label: filterConfig?.label || filter.key,
				value: filter.values,
				onRemove: () => {
					const newFilter = state.filter.filter((f) => f.key !== filter.key);
					updateState({ filter: newFilter });
				},
			});
		});

		// Add groupBy tags - format as "groupBy1 > groupBy2 > ..."
		if (state.groupBy.length > 0) {
			const groupByLabels = state.groupBy.map((key) => {
				const groupByConfig = kioskFilterConfig.groupBy?.find((g) => g.key === key);
				return groupByConfig?.label || key;
			});
			result.push({
				type: 'groupBy',
				key: 'groupBy',
				label: translate('nikki.general.groupBy.title'),
				value: groupByLabels.join(' > '),
				onRemove: () => {
					updateState({ groupBy: [] });
				},
			});
		}

		return result;
	}, [state.search, state.filter, state.groupBy, updateState, translate]);

	const hasActiveFilters = useMemo(() => {
		return (
			state.search.length > 0 ||
			state.filter.length > 0 ||
			state.groupBy.length > 0 ||
			state.sort.length > 0
		);
	}, [state]);

	// Không cần handleSearchChange riêng nữa vì SearchInputWithTags sẽ gọi onSearchChange trực tiếp

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
				<Group gap='xs' align='flex-end'>
					<SearchInputWithTags
						tags={tags}
						onTagRemove={(tag) => tag.onRemove()}
						onSearchChange={(fieldKey, value) => {
							const searchIndex = state.search.findIndex((s) => s.key === fieldKey);
							const newSearch = [...state.search];

							if (value.trim()) {
								if (searchIndex >= 0) {
									newSearch[searchIndex] = { ...newSearch[searchIndex], value };
								}
								else {
									const searchConfig = kioskFilterConfig.search?.find((s) => s.key === fieldKey);
									newSearch.push({
										key: fieldKey,
										value,
										operator: searchConfig?.operator || '~',
									});
								}
							}
							else {
								if (searchIndex >= 0) {
									newSearch.splice(searchIndex, 1);
								}
							}

							updateState({ search: newSearch });
						}}
						placeholder={translate('nikki.vendingMachine.kiosk.search.placeholder')}
						searchFields={kioskFilterConfig.search}
						style={{ minWidth: 300 }}
					/>
					<FilterDropdown
						config={kioskFilterConfig}
						state={state}
						onStateChange={updateState}
						onSearchGraphChange={onSearchGraphChange}
					/>
				</Group>
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
