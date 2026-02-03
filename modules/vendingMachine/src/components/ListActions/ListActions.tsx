/* eslint-disable max-lines-per-function */
import { Button, Group, MultiSelect, TextInput, SegmentedControl, Center } from '@mantine/core';
import { IconPlus, IconRefresh, IconSearch, IconList, IconLayoutGrid } from '@tabler/icons-react';
import React, { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterOffButton } from '../FilterOffButton';


export type ViewMode = 'list' | 'grid';

export interface FilterConfig {
	value: string[];
	onChange: Dispatch<SetStateAction<string[]>>;
	options: Array<{ value: string; label: string }>;
	placeholder?: string;
	maxValues?: number;
	clearable?: boolean;
	minWidth?: number;
}

export interface ListActionsProps {
	onCreate: () => void;
	onRefresh: () => void;
	searchValue: string;
	onSearchChange: (value: string) => void;
	filters?: FilterConfig[];
	searchPlaceholder?: string;
	viewMode?: ViewMode;
	onViewModeChange?: (mode: ViewMode) => void;
}

export const ListActions: React.FC<ListActionsProps> = ({
	onCreate,
	onRefresh,
	searchValue,
	onSearchChange,
	filters = [],
	searchPlaceholder,
	viewMode,
	onViewModeChange,
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
	];

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
				<TextInput
					placeholder={searchPlaceholder || translate('nikki.general.search.placeholder')}
					leftSection={<IconSearch size={16} />}
					value={searchValue}
					onChange={(e) => onSearchChange(e.currentTarget.value)}
					style={{ minWidth: 250 }}
				/>
				{filters.map((filter, index) => (
					<MultiSelect
						key={index}
						placeholder={filter.placeholder || translate('nikki.general.filters.status')}
						data={filter.options}
						value={filter.value}
						onChange={(value) => filter.onChange(value)}
						style={{ minWidth: filter.minWidth || 150 }}
						maxValues={filter.maxValues ?? 2}
						clearable={filter.clearable !== false}
					/>
				))}
				{viewMode !== undefined && onViewModeChange && (
					<SegmentedControl
						data={viewModeSegments}
						value={viewMode}
						onChange={(value) => onViewModeChange(value as ViewMode)}
						size='md'
					/>
				)}
			</Group>
		</Group>
	);
};

