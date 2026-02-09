import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	minWidth?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
	value,
	onChange,
	placeholder,
	minWidth = 250,
}) => {
	const { t: translate } = useTranslation();

	return (
		<TextInput
			placeholder={placeholder || translate('nikki.general.search.placeholder')}
			leftSection={<IconSearch size={16} />}
			value={value}
			onChange={(event) => onChange(event.currentTarget.value)}
			style={{ minWidth }}
		/>
	);
};
