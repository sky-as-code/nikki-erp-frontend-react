import { Flex } from '@mantine/core';
import { FC } from 'react';

import { ModuleSearchInput } from './ModuleSearchInput';


type ModuleSearchPanelProps = {
	searchInputValue: string;
	onSearchChange: (value: string) => void;
	onSearchClear: () => void;
};

export const ModuleSearchPanel: FC<ModuleSearchPanelProps> = ({
	searchInputValue,
	onSearchChange,
	onSearchClear,
}) => {
	return (
		<Flex
			justify={{ base: 'center', sm: 'flex-center' }} gap={'sm'}
			py={'sm'} bdrs={'md'}
			// bg='var(--mantine-color-gray-2)'
			// bg='transparent'
		>
			<ModuleSearchInput
				searchInputValue={searchInputValue}
				onSearchChange={onSearchChange}
				onSearchClear={onSearchClear}
			/>
		</Flex>
	);
};