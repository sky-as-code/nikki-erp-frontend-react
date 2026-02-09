import { MultiSelect } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface FilterOption {
	value: string;
	label: string;
}

export interface FilterMultiSelectProps {
	value: string[];
	onChange: (value: string[]) => void;
	options: FilterOption[];
	placeholder?: string;
	maxValues?: number;
	clearable?: boolean;
	minWidth?: number;
}

export const FilterMultiSelect: React.FC<FilterMultiSelectProps> = ({
	value,
	onChange,
	options,
	placeholder,
	maxValues = 2,
	clearable = true,
	minWidth = 150,
}) => {
	const { t: translate } = useTranslation();

	return (
		<MultiSelect
			placeholder={placeholder || translate('nikki.general.filters.status')}
			data={options}
			value={value}
			onChange={onChange}
			style={{ minWidth }}
			maxValues={maxValues}
			clearable={clearable}
		/>
	);
};
