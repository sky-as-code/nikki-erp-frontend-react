/* eslint-disable max-lines-per-function */
import { Button, Group, SegmentedControl, Center } from '@mantine/core';
import { IconPlus, IconRefresh, IconList, IconLayoutGrid, IconColumns, IconTimeline, IconCalendar, IconMapPin } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterMultiSelect, FilterOption } from '../Filter';
import { FilterOffButton } from '../FilterOffButton';
import { SearchInput } from '../Search';


export type ViewMode = 'list' | 'grid' | 'kanban' | 'gantt' | 'calendar' | 'map';

export interface ActionBarFilterConfig {
	value: string[];
	onChange: (value: string[]) => void;
	options: FilterOption[];
	placeholder?: string;
	maxValues?: number;
	clearable?: boolean;
	minWidth?: number;
}

export interface ActionBarProps {
	onCreate: () => void;
	onRefresh: () => void;
	searchValue: string;
	onSearchChange: (value: string) => void;
	filters?: ActionBarFilterConfig[];
	searchPlaceholder?: string;
	viewMode?: ViewMode;
	onViewModeChange?: (mode: ViewMode) => void;
	viewModeSegments?: ViewMode[];
}

export const ActionBar: React.FC<ActionBarProps> = ({
	onCreate,
	onRefresh,
	searchValue,
	onSearchChange,
	filters = [],
	searchPlaceholder,
	viewMode,
	onViewModeChange,
	viewModeSegments = ['list'],
}) => {
	const { t: translate } = useTranslation();

	const hasActiveFilters =
		searchValue.trim() !== '' ||
		filters.some((filter) => filter.value && filter.value.length > 0);

	const handleClearFilters = () => {
		onSearchChange('');
		filters.forEach((filter) => {
			filter.onChange([]);
		});
	};

	const defaultViewModeSegments = [
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
			value: 'kanban',
			label: (
				<Center h={20}>
					<IconColumns size={16} />
				</Center>
			),
		},
		{
			value: 'gantt',
			label: (
				<Center h={20}>
					<IconTimeline size={16} />
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
		{
			value: 'calendar',
			label: (
				<Center h={20}>
					<IconCalendar size={16} />
				</Center>
			),
		},
	];

	const filteredViewModeSegments = useMemo(() => {
		return defaultViewModeSegments.filter((segment) => viewModeSegments.includes(segment.value as ViewMode));
	}, [viewModeSegments]);

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
					<FilterOffButton onClick={handleClearFilters} />
				)}
				<SearchInput
					value={searchValue}
					onChange={onSearchChange}
					placeholder={searchPlaceholder || translate('nikki.general.search.placeholder')}
				/>
				{filters.map((filter, index) => (
					<FilterMultiSelect
						key={index}
						placeholder={filter.placeholder || translate('nikki.general.filters.status')}
						value={filter.value}
						onChange={filter.onChange}
						options={filter.options}
						minWidth={filter.minWidth || 150}
						maxValues={filter.maxValues ?? 2}
						clearable={filter.clearable !== false}
					/>
				))}
				{filteredViewModeSegments.length > 1 && onViewModeChange && (
					<SegmentedControl
						data={filteredViewModeSegments}
						value={viewMode}
						onChange={(value) => onViewModeChange(value as ViewMode)}
						size='md'
					/>
				)}
			</Group>
		</Group>
	);
};
