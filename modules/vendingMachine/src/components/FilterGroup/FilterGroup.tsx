
import { Button, Group } from '@mantine/core';
import { IconFilterOff } from '@tabler/icons-react';
import { isEmpty } from 'lodash';
import React, { useMemo, useState } from 'react';
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

	const hasActiveFilters = useMemo(() => Object.values(state).some(value => !isEmpty(value)), [state]);

	return (
		<Group gap={'xs'} align='flex-end' wrap='nowrap' style={style}>
			{hasActiveFilters && (
				<Button
					variant='light'
					color='gray'
					onClick={resetState}
				>
					<IconFilterOff size={20} />
				</Button>
			)}
			<Group
				gap={0} align='flex-end' wrap='nowrap'
				bg={'var(--nikki-color-white)'}
				bdrs={'sm'}
				bd={'solid 1px var(--mantine-color-gray-3)'}
				style={style}
			>
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
		</Group>
	);
};
