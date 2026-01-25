import {  Button, Drawer, Flex } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

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
	const { t } = useTranslation();

	return (
		<Drawer.Root
			opened={opened}
			onClose={onClose}
			position={'bottom'}
			size={'sm'}
			offset={8}
			radius={'md'}
		>
			<Drawer.Overlay opacity={0.6} blur={4}/>
			<Drawer.Content>
				<Flex gap={'sm'} h='100%' direction='column' justify='space-between' p={'md'}>
					<ModuleFilterPanel
						viewMode={viewMode}
						onViewModeChange={onViewModeChange}
						filters={filters}
						onFiltersChange={onFiltersChange}
					/>
					<Button
						variant={'light'}
						bg='var(--mantine-color-gray-2)'
						color='var(--mantine-color-gray-6)'
						leftSection={<IconX size={20} />}
						onClick={onClose}
						fullWidth
						radius='md'
					>
						{t('close')}
					</Button>
				</Flex>
			</Drawer.Content>
		</Drawer.Root>
	);
};