import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { FavoritesConfig } from './types';


export interface FavoritesSectionProps {
	favoritesConfig: FavoritesConfig;
	onSaveFavorite: () => void;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({
	favoritesConfig,
	onSaveFavorite,
}) => {
	const { t: translate } = useTranslation();

	if (!favoritesConfig) return null;

	return (
		<Box>
			<Group gap='xs' mb='xs'>
				<IconStar size={16} style={{ color: '#ffd43b' }} />
				<Text size='sm' fw={500}>
					{translate('nikki.general.favorites.title')}
				</Text>
			</Group>
			<Stack gap='xs'>
				<Button
					variant='subtle'
					size='sm'
					leftSection={<IconStar size={16} />}
					onClick={(e) => {
						e.stopPropagation();
						onSaveFavorite();
					}}
				>
					{translate('nikki.general.favorites.save_current')}
				</Button>
				{favoritesConfig.savedFilters && favoritesConfig.savedFilters.length > 0 && (
					<Stack gap={4}>
						{favoritesConfig.savedFilters.map((saved) => (
							<Button
								key={saved.name}
								variant='light'
								size='xs'
								fullWidth
								justify='flex-start'
								onClick={(e) => {
									e.stopPropagation();
									// TODO: Load saved filter
									console.log('Load filter', saved.name);
								}}
							>
								{saved.name}
							</Button>
						))}
					</Stack>
				)}
			</Stack>
		</Box>
	);
};
