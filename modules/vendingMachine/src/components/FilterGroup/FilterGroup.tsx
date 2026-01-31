
import { Group } from '@mantine/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterDropdown } from './FilterDropdown';
import { SearchCombobox } from './SearchCombobox';
import {
	FilterGroupConfig,
	FilterState,
} from './types';



export interface FilterGroupProps {
	config: FilterGroupConfig;
	state: FilterState;
	updateState: (updates: Partial<FilterState>) => void;
	resetState: () => void;
	placeholder?: string;
	style?: React.CSSProperties;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
	config,
	state,
	updateState,
	resetState,
	placeholder,
	style,
}) => {
	const { t: translate } = useTranslation();
	const [filterDropdownOpened, setFilterDropdownOpened] = useState(false);

	return (
		<Group gap='xs' align='flex-end' wrap='nowrap' style={style}>
			<SearchCombobox
				config={config}
				state={state}
				updateState={updateState}
				resetState={resetState}
				placeholder={placeholder || translate('nikki.general.search.placeholder') || 'Tìm kiếm...'}
			/>

			<FilterDropdown
				config={config}
				state={state}
				updateState={updateState}
				resetState={resetState}
				opened={filterDropdownOpened}
				setOpened={setFilterDropdownOpened}
			/>
		</Group>
	);
};
