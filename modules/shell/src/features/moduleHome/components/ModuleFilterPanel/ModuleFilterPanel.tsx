import {
	Center,
	Checkbox,
	SegmentedControl,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import { FC } from 'react';

import { FilterState, GroupByOption, ModuleViewMode, SortByOption } from '../ModuleHomePage';


type ModuleFilterPanelProps = {
	viewMode: ModuleViewMode;
	onViewModeChange: (mode: ModuleViewMode) => void;
	filters: FilterState;
	onFiltersChange: (filters: FilterState) => void;
};

export const ModuleFilterPanel: FC<ModuleFilterPanelProps> = ({
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
		<Stack gap={'sm'} bdrs={'md'} bg={'var(--mantine-color-white)'} p={'md'}>
			<ViewModeSegmentedControl
				viewMode={viewMode}
				onViewModeChange={onViewModeChange}
			/>

			<Checkbox
				label={<Text className='capitalize' size={'sm'} fw={500}>Show disabled modules</Text>}
				color='var(--mantine-color-black)'
				checked={filters.showDisabled}
				onChange={handleShowDisabledChange}
			/>
			<Checkbox
				label={<Text className='capitalize' size={'sm'} fw={500}>Show orphaned modules</Text>}
				color='var(--mantine-color-black)'
				checked={filters.showOrphaned}
				onChange={handleShowOrphanedChange}
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
	value: GroupByOption;
	onChange: (value: GroupByOption) => void;
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
		/>
	);
};


type SortBySelectProps = {
	value: SortByOption | null;
	onChange: (value: SortByOption | null) => void;
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
		/>
	);
};


const ViewModeSegmentedControl: FC<{
	viewMode: ModuleViewMode;
	onViewModeChange: (mode: ModuleViewMode) => void;
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
		/>
	);
};