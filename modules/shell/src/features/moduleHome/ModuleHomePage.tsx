import {
	Box,
	Container,
	Flex,
} from '@mantine/core';
import { useState } from 'react';

import { mockModules as mockModuleListByCategory } from './mockModules';
import { ModuleFilterPanel } from './ModuleFilterPanel';
import { ModuleGridView } from './ModuleGridView';
import classes from './ModuleHomePage.module.css';
import { ModuleListView } from './ModuleListView';
import { ModuleSearchPanel } from './ModuleSearchPanel';


export type ModuleViewMode = 'grid' | 'list';

export function ModuleHomePage(): React.ReactNode {
	const [viewMode, setViewMode] = useState<ModuleViewMode>('list');

	return (
		<Box className={classes.homeContent}>
			<Container pt={{ xl: 30, sm: 20, base: 10 }} size={'lg'} pb={'xl'} h={'100%'}>
				<Flex gap={'lg'} h={'100%'}>
					<Box px={{ xl: 15, sm: 10 }} display={{ base: 'none', sm: 'block' }}>
						<ModuleFilterPanel viewMode={viewMode} onViewModeChange={setViewMode} />
					</Box>
					<Flex direction='column' gap={'lg'} flex={1}>
						<ModuleSearchPanel />
						<Box h={'100%'} p={'md'}>
							{viewMode === 'grid' ?
								<ModuleGridView modules={mockModuleListByCategory} /> :
								<ModuleListView modules={mockModuleListByCategory} />}
						</Box>
					</Flex>
				</Flex>
			</Container>
		</Box>
	);
}