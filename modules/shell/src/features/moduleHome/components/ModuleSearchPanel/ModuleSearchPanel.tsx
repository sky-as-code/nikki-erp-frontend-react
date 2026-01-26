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
			px={{ xl: 'md', sm:  'xs' }}
			bdrs={'md'}
		>
			<ModuleSearchInput
				searchInputValue={searchInputValue}
				onSearchChange={onSearchChange}
				onSearchClear={onSearchClear}
			/>
		</Flex>
	);
};