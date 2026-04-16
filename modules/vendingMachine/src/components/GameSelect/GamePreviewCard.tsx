import { ActionIcon, Badge, Card, Group, Stack, Text } from '@mantine/core';
import { IconDeviceGamepad2, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Game } from '@/features/games/types';


export interface GamePreviewCardProps {
	game: Game;
	onRemove?: () => void;
}

export const GamePreviewCard: React.FC<GamePreviewCardProps> = ({ game, onRemove }) => {
	const { t: translate } = useTranslation();

	return (
		<Card withBorder p='md' radius='md'>
			<Stack gap='sm'>
				<Group justify='space-between' align='flex-start'>
					<Group gap='xs'>
						<IconDeviceGamepad2 size={24} />
						<Stack gap={2}>
							<Text size='sm' fw={600}>{game.name}</Text>
							<Badge size='sm' variant='filled'>{game.code}</Badge>
						</Stack>
					</Group>
					{onRemove && (
						<ActionIcon
							variant='subtle'
							color='red'
							size='sm'
							onClick={onRemove}
						>
							<IconTrash size={16} />
						</ActionIcon>
					)}
				</Group>

				{game.description && (
					<Text size='xs' c='dimmed' lineClamp={2}>
						{game.description}
					</Text>
				)}

				<Group gap='xs' wrap='wrap'>
					<Badge size='sm' variant='filled' color={game.status === 'active' ? 'green' : 'gray'}>
						{game.status}
					</Badge>
					<Text size='xs' c='dimmed'>
						{translate('nikki.vendingMachine.games.fields.latestVersion')}: {game.latestVersion}
					</Text>
				</Group>
			</Stack>
		</Card>
	);
};
