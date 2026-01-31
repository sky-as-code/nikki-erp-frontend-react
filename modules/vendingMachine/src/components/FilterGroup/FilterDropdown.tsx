
import {
	ActionIcon,
	Box,
	Divider,
	Menu,
	Stack,
} from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import React, { useCallback } from 'react';

import { FavoritesSection } from './FavoritesSection';
import { FilterSection } from './FilterSection';
import { GroupBySection } from './GroupBySection';
import { SortSection } from './SortSection';
import { TagsSection } from './TagsSection';
import {
	FilterGroupConfig,
	FilterState,
} from './types';
import { useFilterOperations } from './useFilterOperations';
import { filterStateToSearchGraph } from './utils';


export type FilterViewMode = 'list' | 'compact';

export interface FilterDropdownProps {
	config: FilterGroupConfig;
	state: FilterState;
	updateState: (updates: Partial<FilterState>) => void;
	resetState: () => void;
	opened?: boolean;
	setOpened?: (opened: boolean) => void;
}


export const FilterDropdown: React.FC<FilterDropdownProps> = ({
	config,
	state,
	updateState,
	resetState,
	opened,
	setOpened,

}) => {
	const { tags,
		handleFilterChange,
		handleGroupByChange,
		handleSortChange,
	} = useFilterOperations({
		state,
		updateState,
		config,
	});

	const handleSaveFavorite = useCallback(() => {
		if (config.favorites?.onSave) {
			const graph = filterStateToSearchGraph(state);
			const name = prompt('Nhập tên cho bộ lọc:');
			if (name) {
				config.favorites.onSave(name, graph);
			}
		}
	}, [state, config]);


	return (
		<Menu
			opened={opened}
			onChange={setOpened}
			position='bottom-end'
			width={500}
			shadow='md'
			// closeOnClickOutside={false}
			closeOnItemClick={false}
			trapFocus={false}
		>
			<Menu.Target>
				<ActionIcon
					variant={'outline'}
					color={opened ? 'blue' : 'gray'}
					size='lg'
				>
					<IconChevronDown size={16} />
				</ActionIcon>
			</Menu.Target>

			<Menu.Dropdown>
				<Box p='md' style={{ maxHeight: '70vh', overflowY: 'auto' }}>
					<Stack gap='md'>
						<TagsSection tags={tags} onClearAll={resetState} />
						{tags.length > 0 && <Divider />}
						<FilterSection
							filterConfigs={config.filter || []}
							state={state}
							onFilterChange={handleFilterChange}
						/>
						{config.filter && config.filter.length > 0 && <Divider />}
						<GroupBySection
							groupByConfigs={config.groupBy || []}
							selectedKeys={state.groupBy}
							onGroupByChange={handleGroupByChange}
						/>
						{config.groupBy && config.groupBy.length > 0 && <Divider />}
						<SortSection
							sortConfigs={config.sort || []}
							sortState={state.sort}
							onSortChange={handleSortChange}
						/>
						{config.sort && config.sort.length > 0 && <Divider />}
						{config.favorites && (
							<FavoritesSection
								favoritesConfig={config.favorites}
								onSaveFavorite={handleSaveFavorite}
							/>
						)}
					</Stack>
				</Box>
			</Menu.Dropdown>
		</Menu>
	);
};
