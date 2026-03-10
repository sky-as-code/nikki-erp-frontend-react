import { Group, MultiSelect, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { FilterOffButton } from '../FilterOffButton';

import type { ControlPanelFilterConfig } from './types';


export interface ControlPanelFilterProps {
	filters?: ControlPanelFilterConfig[];
	search?: {
		value?: string;
		onChange?: (value: string) => void;
		placeholder?: string;
	};
}

export const ControlPanelFilter: React.FC<ControlPanelFilterProps> = ({
	filters = [],
	search,
}) => {
	const { t: translate } = useTranslation();

	const hasActiveFilters =
		search?.value?.trim() !== '' ||
		filters.some((filter) => filter.value && filter.value.length > 0);

	const handleClearFilters = () => {
		search?.onChange?.('');
		filters.forEach((filter) => {
			filter.onChange([]);
		});
	};

	return (
		<Group gap='md' wrap='wrap' align='flex-end'>
			{hasActiveFilters && (
				<FilterOffButton onClick={handleClearFilters} />
			)}
			<TextInput
				placeholder={search?.placeholder || translate('nikki.general.search.placeholder')}
				leftSection={<IconSearch size={16} />}
				value={search?.value}
				onChange={(e) => search?.onChange?.(e.currentTarget.value)}
				style={{ minWidth: 250 }}
				fz='sm' fw={500} size='sm'
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
					miw={filter.minWidth || 250}
					fz='sm' fw={500} size='sm'
				/>
			))}
		</Group>
	);
};
