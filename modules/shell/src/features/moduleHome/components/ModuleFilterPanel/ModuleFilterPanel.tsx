import {
	Center,
	Checkbox,
	MantineStyleProps,
	SegmentedControl,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import { FC } from 'react';

import { FilterState, GroupByOption, ModuleViewMode, SortByOption } from '../ModuleHomePage';


const MODULE_FILTER_TEST_ID = 'shell.moduleFilter';


type ModuleFilterPanelProps = {
	styleProps?: MantineStyleProps,
	viewMode: ModuleViewMode,
	onViewModeChange: (mode: ModuleViewMode) => void,
	filters: FilterState,
	onFiltersChange: (filters: FilterState) => void,
};

export const ModuleFilterPanel: FC<ModuleFilterPanelProps> = ({
	styleProps,
	viewMode,
	onViewModeChange,
	filters,
	onFiltersChange,
}) => {
	const handleShowDisabledChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onFiltersChange({ ...filters, showDisabled: event.currentTarget.checked });
	};

	const handleShowOrphanedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onFiltersChange({ ...filters, showOrphaned: event.currentTarget.checked });
	};

	const handleSortByChange = (value: string | null) => {
		onFiltersChange({ ...filters, sortBy: value as SortByOption | null });
	};

	const handleGroupByChange = (value: string | null) => {
		onFiltersChange({ ...filters, groupBy: value as GroupByOption });
	};

	return (
		<Stack
			gap={'sm'} bg='light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))'
			{...styleProps}
			bdrs={styleProps?.bdrs || 'md'}
			p={styleProps?.p || 'md'}
		>
			<ViewModeSegmentedControl
				viewMode={viewMode}
				onViewModeChange={onViewModeChange}
			/>

			<Checkbox
				label={<Text className='capitalize' size={'sm'} fw={500}>Show disabled modules</Text>}
				color='var(--mantine-color-black)'
				checked={filters.showDisabled}
				onChange={handleShowDisabledChange}
				{...testAttrs(MODULE_FILTER_TEST_ID, 'showDisabled')}
			/>
			<Checkbox
				label={<Text className='capitalize' size={'sm'} fw={500}>Show orphaned modules</Text>}
				color='var(--mantine-color-black)'
				checked={filters.showOrphaned}
				onChange={handleShowOrphanedChange}
				{...testAttrs(MODULE_FILTER_TEST_ID, 'showOrphaned')}
			/>

			<SortBySelect
				value={filters.sortBy}
				onChange={handleSortByChange}
			/>
			<GroupBySelect
				value={filters.groupBy}
				onChange={handleGroupByChange}
			/>
		</Stack>
	);
};


type GroupBySelectProps = {
	value: GroupByOption,
	onChange: (value: GroupByOption) => void,
};

const GroupBySelect: FC<GroupBySelectProps> = ({ value, onChange }) => {
	return (
		<Select
			label={
				<Text className='capitalize' size={'sm'} fw={700}>
					Group by
				</Text>
			}
			placeholder='Pick value'
			data={['Category', 'Status']}
			value={value}
			onChange={(val) => onChange(val as GroupByOption)}
			clearable
			{...testAttrs(MODULE_FILTER_TEST_ID, 'groupBy')}
		/>
	);
};


type SortBySelectProps = {
	value: SortByOption | null,
	onChange: (value: SortByOption | null) => void,
};

const SortBySelect: FC<SortBySelectProps> = ({ value, onChange }) => {
	return (
		<Select
			label={
				<Text className='capitalize' size={'sm'} fw={700}>
					Sort by
				</Text>
			}
			placeholder='Pick value'
			data={['Name', 'Commonly used']}
			value={value}
			onChange={(val) => onChange(val as SortByOption | null)}
			clearable
			{...testAttrs(MODULE_FILTER_TEST_ID, 'sortBy')}
		/>
	);
};


const ViewModeSegmentedControl: FC<{
	viewMode: ModuleViewMode,
	onViewModeChange: (mode: ModuleViewMode) => void,
}> = ({ viewMode, onViewModeChange }) => {
	const segments = [

		{
			value: 'list',
			label: (
				<Center style={{ gap: 10 }}>
					<IconList size={16} />
					<span>List</span>
				</Center>
			),
		},
		{
			value: 'grid',
			label: (
				<Center style={{ gap: 10 }}>
					<IconLayoutGrid size={16} />
					<span>Grid</span>
				</Center>
			),
		},
	];

	return (
		<SegmentedControl
			data={segments}
			value={viewMode}
			onChange={(val: string) => onViewModeChange(val as ModuleViewMode)}
			{...testAttrs(MODULE_FILTER_TEST_ID, 'viewMode')}
		/>
	);
};