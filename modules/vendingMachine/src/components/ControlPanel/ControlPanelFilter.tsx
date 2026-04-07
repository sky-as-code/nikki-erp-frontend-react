import { Group, MultiSelect, Select, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { FilterOffButton } from '../FilterOffButton';

import type { ControlPanelFilterConfig, ControlPanelOptionFilter, ControlPanelSearchFilter } from './types';


export interface ControlPanelFilterProps {
	filters?: ControlPanelFilterConfig[];

	/** @deprecated Use a filter with type='search' in filters[] instead */
	search?: {
		value?: string;
		onChange?: (value: string) => void;
		placeholder?: string;
	};
}

function isSearchFilter(filter: ControlPanelFilterConfig): filter is ControlPanelSearchFilter {
	return filter.type === 'search';
}

const SearchFilterItem: React.FC<{ filter: ControlPanelSearchFilter }> = ({ filter }) => {
	const { t: translate } = useTranslation();
	return (
		<TextInput
			placeholder={filter.placeholder || translate('nikki.general.search.placeholder')}
			leftSection={<IconSearch size={16} />}
			value={filter.value}
			onChange={(e) => filter.onChange(e.currentTarget.value)}
			style={{ minWidth: filter.minWidth || 250 }}
			fz='sm' fw={500} size='sm'
		/>
	);
};

const SelectFilterItem: React.FC<{ filter: ControlPanelOptionFilter }> = ({ filter }) => {
	const { t: translate } = useTranslation();
	return (
		<Select
			placeholder={filter.placeholder || translate('nikki.general.filters.status')}
			data={filter.options}
			value={filter.value[0] ?? null}
			onChange={(val) => filter.onChange(val ? [val] : [])}
			style={{ minWidth: filter.minWidth || 150 }}
			clearable={filter.clearable !== false}
			miw={filter.minWidth || 250}
			fz='sm' fw={500} size='sm'
		/>
	);
};

const MultiSelectFilterItem: React.FC<{ filter: ControlPanelOptionFilter }> = ({ filter }) => {
	const { t: translate } = useTranslation();
	return (
		<MultiSelect
			placeholder={filter.placeholder || translate('nikki.general.filters.status')}
			data={filter.options}
			value={filter.value}
			onChange={(value) => filter.onChange(value)}
			style={{ minWidth: filter.minWidth || 150 }}
			maxValues={filter.maxValues ?? 2}
			clearable={filter.clearable !== false}
			miw={filter.minWidth || 250}
			fz='sm' fw={500} size='sm'
		/>
	);
};

const filterComponentMap: Record<string, React.FC<{ filter: any }>> = {
	search: SearchFilterItem,
	select: SelectFilterItem,
	multiSelect: MultiSelectFilterItem,
};

function hasActiveValues(filters: ControlPanelFilterConfig[]): boolean {
	return filters.some((f) => {
		if (isSearchFilter(f)) return f.value.trim() !== '';
		return f.value.length > 0;
	});
}

function clearAllFilters(
	filters: ControlPanelFilterConfig[],
	legacySearch?: ControlPanelFilterProps['search'],
) {
	legacySearch?.onChange?.('');
	for (const f of filters) {
		if (isSearchFilter(f)) f.onChange('');
		else f.onChange([]);
	}
}

export const ControlPanelFilter: React.FC<ControlPanelFilterProps> = ({
	filters = [],
	search,
}) => {
	const { t: translate } = useTranslation();

	const hasActive =
		(search?.value?.trim() ?? '') !== '' || hasActiveValues(filters);

	return (
		<Group gap='md' wrap='wrap' align='flex-end'>
			{hasActive && (
				<FilterOffButton onClick={() => clearAllFilters(filters, search)} />
			)}

			{search && (
				<TextInput
					placeholder={search.placeholder || translate('nikki.general.search.placeholder')}
					leftSection={<IconSearch size={16} />}
					value={search.value}
					onChange={(e) => search.onChange?.(e.currentTarget.value)}
					style={{ minWidth: 250 }}
					fz='sm' fw={500} size='sm'
				/>
			)}

			{filters.map((filter, index) => {
				const Component = filterComponentMap[filter.type ?? 'multiSelect'];
				if (!Component) return null;
				return <Component key={filter.key ?? index} filter={filter} />;
			})}
		</Group>
	);
};
