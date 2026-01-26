import {  Button, Drawer, Flex } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

import { FilterState, ModuleViewMode } from '../ModuleHomePage';
import { ModuleFilterPanel } from './ModuleFilterPanel';


type FilterDrawerProps = {
	opened: boolean;
	onClose: () => void;
	viewMode: ModuleViewMode;
	onViewModeChange: (mode: ModuleViewMode) => void;
	filters: FilterState;
	onFiltersChange: (filters: FilterState) => void;
};

export const ModuleFilterDrawer: React.FC<FilterDrawerProps> = ({
	opened,
	onClose,
	viewMode,
	onViewModeChange,
	filters,
	onFiltersChange,
}) => {
	return (
		<Drawer.Root
			opened={opened}
			onClose={onClose}
			position={'bottom'}
			size={'xs'}
			offset={8}
			radius={'md'}
		>
			<Drawer.Overlay opacity={0.6} blur={4}/>
			<Drawer.Content>
				<Flex justify='flex-end' p={4}>
					<Button variant='transparent'
						color='var(--mantine-color-gray-6)'
						h={24} w={24} p={2}
						onClick={onClose}
					>
						<IconX size={20} />
					</Button>
				</Flex>
				<Drawer.Body>
					<ModuleFilterPanel
						styleProps={{
							p: 'xs',
						}}
						viewMode={viewMode}
						onViewModeChange={onViewModeChange}
						filters={filters}
						onFiltersChange={onFiltersChange}
					/>
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
};