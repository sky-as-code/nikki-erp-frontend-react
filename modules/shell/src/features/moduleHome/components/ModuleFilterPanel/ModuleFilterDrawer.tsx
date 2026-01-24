import { Button, Center, Drawer, Stack } from '@mantine/core';
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
		<Drawer
			opened={opened}
			onClose={onClose}
			withCloseButton={false}
			position={'bottom'}
			size={'sm'}
			radius={'sm'}
			overlayProps={{ opacity: 0.6, blur: 4 }}
		>
			<Stack gap={'sm'}>
				<ModuleFilterPanel
					viewMode={viewMode}
					onViewModeChange={onViewModeChange}
					filters={filters}
					onFiltersChange={onFiltersChange}
				/>
				<Center px={'md'}>
					<Button
						variant={'outline'}
						color='var(--mantine-color-gray-6)'
						leftSection={<IconX size={20} />}
						onClick={onClose}
						fullWidth
					>
						{t('close')}
					</Button>
				</Center>
			</Stack>
		</Drawer>
	);
};