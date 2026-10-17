import { Box, Container, Flex } from '@mantine/core';
import { useShellCommand } from '@nikkierp/shell/commandBus';
import { MODULE_COMMANDS, SearchModuleResponse } from '@nikkierp/shell/erpModules';
import { LoadingState } from '@nikkierp/ui/components';
import React, { useState } from 'react';

import { MobileBottomBar } from './MobileButtomBar';
import { ModuleFilterDrawer, ModuleFilterPanel } from './ModuleFilterPanel';
import { ModuleGridView } from './ModuleGridView/ModuleGridView';
import { ModuleLoadErrorState } from './ModuleGroups/ModuleGroups';
import classes from './ModuleHomePage.module.css';
import { ModuleListView } from './ModuleListView';
import { ModuleSearchPanel } from './ModuleSearchPanel/ModuleSearchPanel';
import { useQueryModule } from '../hooks/useQueryModule';

import type { ModuleGroup, ModuleViewMode } from '../moduleHomeModel';


type ModuleListStatus = 'loading' | 'error' | 'ready';

function useModuleList() {
	const listAll = useShellCommand<SearchModuleResponse>(MODULE_COMMANDS.listAll);
	const publishListAll = listAll.publish;
	React.useEffect(() => {
		void publishListAll();
	}, [publishListAll]);

	const failed = listAll.error != null || listAll.clientErrors.length > 0;
	const query = useQueryModule(listAll.data);
	// `isPending` is still false on the first render, before the effect publishes, hence the data check.
	let status: ModuleListStatus = 'ready';
	if (listAll.data == null && !listAll.isPending && failed) {
		status = 'error';
	}
	else if (listAll.isPending || listAll.data == null || query.isAccessPending) {
		status = 'loading';
	}
	return { ...query, status };
}

export function ModuleHomePage(): React.ReactNode {
	const query = useModuleList();
	const [drawerOpened, setDrawerOpened] = useState(false);

	return (
		<Box className={classes.homeContent}>
			<Container size={'lg'} h={'100%'} p={{ md: 'lg', sm: 'md', xs: 'sm', base: 'xs' }} mb={'60px'}>
				<Flex h={'100%'} gap={{ lg: 'lg', md: 'md', base: 0 }}>
					<Box flex={1} p={{ md: 'sm', xs: 'xs', base: 0 }}>
						<Box display={{ base: 'none', md: 'block' }} mb={'xl'}>
							<ModuleSearchPanel
								searchInputValue={query.searchInputValue}
								onSearchChange={query.handleSearchChange}
								onSearchClear={query.handleSearchClear}
							/>
						</Box>
						<Box h={'100%'} p={0}>
							<ModuleListContent status={query.status} viewMode={query.viewMode} groups={query.groups} />
						</Box>
					</Box>
					{/* After the content in the DOM so Tab goes search -> modules; `order` keeps it on the left. */}
					<Box display={{ base: 'none', md: 'block' }} p={{ md: 'sm', xs: 'xs', base: 0 }} style={{ order: -1 }}>
						<ModuleFilterPanel
							viewMode={query.viewMode}
							onViewModeChange={query.setViewMode}
							filters={query.filters}
							onFiltersChange={query.setFilters}
						/>
					</Box>
				</Flex>
			</Container>

			<MobileBottomBar
				searchInputValue={query.searchInputValue}
				onSearchChange={query.handleSearchChange}
				onSearchClear={query.handleSearchClear}
				onFilterClick={() => setDrawerOpened(true)}
			/>

			<ModuleFilterDrawer
				opened={drawerOpened}
				onClose={() => setDrawerOpened(false)}
				viewMode={query.viewMode}
				onViewModeChange={query.setViewMode}
				filters={query.filters}
				onFiltersChange={query.setFilters}
			/>
		</Box>
	);
}

type ModuleListContentProps = {
	status: ModuleListStatus,
	viewMode: ModuleViewMode,
	groups: ModuleGroup[],
};

function ModuleListContent({ status, viewMode, groups }: ModuleListContentProps): React.ReactNode {
	if (status === 'loading') {
		return <LoadingState />;
	}
	if (status === 'error') {
		return <ModuleLoadErrorState />;
	}
	return viewMode === 'grid' ? <ModuleGridView groups={groups} /> : <ModuleListView groups={groups} />;
}
