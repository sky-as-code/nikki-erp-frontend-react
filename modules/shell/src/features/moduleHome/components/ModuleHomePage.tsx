import {Box, Container, Flex } from '@mantine/core';
import { useMemo, useState } from 'react';

import { MobileBottomBar } from './MobileButtomBar';
import { ModuleFilterDrawer, ModuleFilterPanel } from './ModuleFilterPanel';
import { ModuleGridView } from './ModuleGridView/ModuleGridView';
import classes from './ModuleHomePage.module.css';
import { ModuleListView } from './ModuleListView';
import { ModuleSearchPanel } from './ModuleSearchPanel/ModuleSearchPanel';
import { useQueryModule } from '../hooks/useQueryModule';


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

	const [drawerOpened, setDrawerOpened] = useState(false);

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
			<Container
				size={'lg'} h={'100%'}
				p={{ md: 'lg', sm: 'md', xs: 'sm', base: 'xs' }}
				mb={'60px'}
			>
				<Flex h={'100%'} gap={{ lg: 'lg', md: 'md', base: 0}}>
					<Box
						display={{ base: 'none', md: 'block' }}
						p={{ md: 'sm', xs: 'xs', base: 0 }}
					>
						<ModuleFilterPanel
							viewMode={viewMode}
							onViewModeChange={setViewMode}
							filters={filters}
							onFiltersChange={setFilters}
						/>
					</Box>
					<Box flex={1} p={{ md: 'sm', xs: 'xs', base: 0 }} >
						<Box display={{ base: 'none', md: 'block' }} mb={'xl'}>
							<ModuleSearchPanel
								searchInputValue={searchInputValue}
								onSearchChange={handleSearchChange}
								onSearchClear={handleSearchClear}
							/>
						</Box>
						<Box h={'100%'} p={0}>
							{viewMode === 'grid' ? gridView : listView}
						</Box>
					</Box>
				</Flex>
			</Container>

			<MobileBottomBar
				searchInputValue={searchInputValue}
				onSearchChange={handleSearchChange}
				onSearchClear={handleSearchClear}
				onFilterClick={() => setDrawerOpened(true)}
			/>

			<ModuleFilterDrawer
				opened={drawerOpened}
				onClose={() => setDrawerOpened(false)}
				viewMode={viewMode}
				onViewModeChange={setViewMode}
				filters={filters}
				onFiltersChange={setFilters}
			/>
		</Box>
	);
}