import { Group, MultiSelect, Select, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { debounce } from 'lodash';
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

const SEARCH_DEBOUNCE_MS = 300;

function isSearchFilter(filter: ControlPanelFilterConfig): filter is ControlPanelSearchFilter {
	return filter.type === 'search';
}

type DebouncedSearchTextInputProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	minWidth?: number;
};

const DebouncedSearchTextInput: React.FC<DebouncedSearchTextInputProps> = ({
	value,
	onChange,
	placeholder,
	minWidth = 250,
}) => {
	const { t: translate } = useTranslation();
	const [localValue, setLocalValue] = React.useState(value);
	const onChangeRef = React.useRef(onChange);
	onChangeRef.current = onChange;

	const debouncedNotify = React.useMemo(
		() => debounce((v: string) => onChangeRef.current(v), SEARCH_DEBOUNCE_MS),
		[],
	);

	React.useEffect(() => () => debouncedNotify.cancel(), [debouncedNotify]);

	React.useEffect(() => {
		debouncedNotify.cancel();
		setLocalValue(value);
	}, [value, debouncedNotify]);

	return (
		<TextInput
			placeholder={placeholder || translate('nikki.general.search.placeholder')}
			leftSection={<IconSearch size={16} />}
			value={localValue}
			onChange={(e) => {
				const next = e.currentTarget.value;
				setLocalValue(next);
				debouncedNotify(next);
			}}
			style={{ minWidth }}
			fz='sm' fw={500} size='sm'
		/>
	);
};

const SearchFilterItem: React.FC<{ filter: ControlPanelSearchFilter }> = ({ filter }) => (
	<DebouncedSearchTextInput
		value={filter.value}
		onChange={filter.onChange}
		placeholder={filter.placeholder}
		minWidth={filter.minWidth || 250}
	/>
);

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
	const hasActive =
		(search?.value?.trim() ?? '') !== '' || hasActiveValues(filters);

	return (
		<Group gap='md' wrap='wrap' align='flex-end'>
			{hasActive && (
				<FilterOffButton onClick={() => clearAllFilters(filters, search)} />
			)}

			{search && (
				<DebouncedSearchTextInput
					value={search.value ?? ''}
					onChange={(v) => search.onChange?.(v)}
					placeholder={search.placeholder}
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
