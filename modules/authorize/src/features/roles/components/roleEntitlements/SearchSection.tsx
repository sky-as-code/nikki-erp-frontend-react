import { Button, Group, Input } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


interface SearchSectionProps {
	searchQuery: string;
	onSearchQueryChange: (query: string) => void;
	onSearch: () => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
	searchQuery,
	onSearchQueryChange,
	onSearch,
}) => {
	const { t: translate } = useTranslation();

	const handleSearchKeyPress = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			onSearch();
		}
	}, [onSearch]);

	return (
		<Group>
			<Input
				placeholder={translate('nikki.authorize.role.entitlements.search_placeholder')}
				value={searchQuery}
				onChange={(e) => onSearchQueryChange(e.target.value)}
				onKeyPress={handleSearchKeyPress}
				style={{ flex: 1 }}
			/>
			<Button
				leftSection={<IconSearch size={16} />}
				onClick={onSearch}
			>
				{translate('nikki.general.actions.search')}
			</Button>
		</Group>
	);
};

