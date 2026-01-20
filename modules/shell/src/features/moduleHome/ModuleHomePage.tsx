import {
	Box,
	Container,
	Flex,
} from '@mantine/core';
import { useMemo } from 'react';

import { ModuleFilterPanel } from './ModuleFilterPanel';
import { ModuleGridView } from './ModuleGridView';
import classes from './ModuleHomePage.module.css';
import { ModuleListView } from './ModuleListView';
import { ModuleSearchPanel } from './ModuleSearchPanel';
import { useQueryModule } from './useQueryModule';


export type ModuleViewMode = 'grid' | 'list';
export type SortByOption = 'Name' | 'Commonly used';
export type GroupByOption = 'Category' | 'Status' | null;

export interface FilterState {
	showDisabled: boolean;
	showOrphaned: boolean;
	sortBy: SortByOption | null;
	groupBy: GroupByOption;
}

export function ModuleHomePage(): React.ReactNode {
	const {
		viewMode,
		setViewMode,
		searchInputValue,
		handleSearchChange,
		handleSearchClear,
		filters,
		setFilters,
		filteredModules,
	} = useQueryModule();

	const gridView = useMemo(
		() => <ModuleGridView modules={filteredModules} />,
		[filteredModules],
	);

	const listView = useMemo(
		() => <ModuleListView modules={filteredModules} />,
		[filteredModules],
	);

	return (
		<Box className={classes.homeContent}>
			<Container pt={{ xl: 30, sm: 20, base: 10 }} size={'lg'} pb={'xl'} h={'100%'}>
				<Flex gap={'lg'} h={'100%'}>
					<Box px={{ xl: 15, sm: 10 }} display={{ base: 'none', sm: 'block' }}>
						<ModuleFilterPanel
							viewMode={viewMode}
							onViewModeChange={setViewMode}
							filters={filters}
							onFiltersChange={setFilters}
						/>
					</Box>
					<Flex direction='column' gap={'lg'} flex={1}>
						<ModuleSearchPanel
							searchInputValue={searchInputValue}
							onSearchChange={handleSearchChange}
							onSearchClear={handleSearchClear}
						/>
						<Box h={'100%'} p={'md'}>
							{viewMode === 'grid' ? gridView : listView}
						</Box>
					</Flex>
				</Flex>
			</Container>
		</Box>
	);
}