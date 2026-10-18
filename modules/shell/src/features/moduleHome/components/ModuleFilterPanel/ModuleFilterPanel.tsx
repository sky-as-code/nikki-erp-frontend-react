import { Center, Checkbox, MantineStyleProps, SegmentedControl, Stack } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Select } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import { FC } from 'react';

import type { FilterState, GroupByOption, ModuleViewMode } from '../../moduleHomeModel';


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
	const translate = useTranslate('common');

	return (
		<Stack
			gap={'sm'} bg='light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))'
			{...styleProps}
			bdrs={styleProps?.bdrs || 'md'}
			p={styleProps?.p || 'md'}
		>
			<ViewModeSegmentedControl viewMode={viewMode} onViewModeChange={onViewModeChange} />

			<Checkbox
				label={translate('module.showUnavailable')}
				checked={filters.showUnavailable}
				onChange={(event) => onFiltersChange({ ...filters, showUnavailable: event.currentTarget.checked })}
				{...testAttrs(MODULE_FILTER_TEST_ID, 'showUnavailable')}
			/>

			<GroupBySelect
				value={filters.groupBy}
				onChange={(groupBy) => onFiltersChange({ ...filters, groupBy })}
			/>
		</Stack>
	);
};


type GroupBySelectProps = {
	value: GroupByOption,
	onChange: (value: GroupByOption) => void,
};

const GroupBySelect: FC<GroupBySelectProps> = ({ value, onChange }) => {
	const translate = useTranslate('common');
	const options: { value: GroupByOption, label: string }[] = [
		{ value: 'none', label: translate('module.groupBy.none') },
		{ value: 'category', label: translate('module.groupBy.category') },
	];

	return (
		<Select<GroupByOption>
			label={translate('search.groupBy')}
			data={options}
			value={value}
			allowDeselect={false}
			onChange={(selected) => selected && onChange(selected)}
			{...testAttrs(MODULE_FILTER_TEST_ID, 'groupBy')}
		/>
	);
};


const ViewModeSegmentedControl: FC<{
	viewMode: ModuleViewMode,
	onViewModeChange: (mode: ModuleViewMode) => void,
}> = ({ viewMode, onViewModeChange }) => {
	const translate = useTranslate('common');
	const segments = [
		{ value: 'list', icon: <IconList size={16} />, label: translate('datatable.list') },
		{ value: 'grid', icon: <IconLayoutGrid size={16} />, label: translate('datatable.grid') },
	].map((segment) => ({
		value: segment.value,
		label: (
			<Center style={{ gap: 10 }}>
				{segment.icon}
				<span>{segment.label}</span>
			</Center>
		),
	}));

	return (
		<SegmentedControl
			data={segments}
			value={viewMode}
			onChange={(val: string) => onViewModeChange(val as ModuleViewMode)}
			{...testAttrs(MODULE_FILTER_TEST_ID, 'viewMode')}
		/>
	);
};
