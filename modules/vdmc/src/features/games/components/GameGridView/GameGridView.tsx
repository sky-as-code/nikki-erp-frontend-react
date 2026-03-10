import { ActionIcon, Badge, Box, Card, Group, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { IconDeviceGamepad, IconEdit, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Game } from '../../types';


export interface GameGridViewProps {
	games: Game[];
	isLoading?: boolean;
	onViewDetail: (gameId: string) => void;
	onEdit?: (gameId: string) => void;
	onDelete?: (gameId: string) => void;
}

export const GameGridView: React.FC<GameGridViewProps> = ({
	games,
	isLoading = false,
	onViewDetail,
	onEdit,
	onDelete,
}) => {
	const { t: translate } = useTranslation();

	const getStatusBadge = (status: 'active' | 'inactive') => {
		const statusMap = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
		};
		const statusInfo = statusMap[status];
		return <Badge color={statusInfo.color} size='sm'>{statusInfo.label}</Badge>;
	};

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (games.length === 0) {
		return <Text c='dimmed'>{translate('nikki.vendingMachine.games.messages.no_games')}</Text>;
	}

	return (
		<SimpleGrid
			cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
			spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
		>
			{games.map((game) => (
				<Card
					key={game.id}
					shadow='sm'
					padding='lg'
					radius='md'
					withBorder
					style={{
						cursor: 'pointer',
					}}
					onClick={() => onViewDetail(game.id)}
				>
					<Stack gap='sm'>
						<Group justify='space-between' align='flex-start'>
							<Group gap='xs'>
								<IconDeviceGamepad size={36} stroke={1.5} />
								<Stack gap={0}>
									<Text fw={600} size='sm'>{game.code}</Text>
									<Text size='xs' c='dimmed'>{game.name}</Text>
								</Stack>
							</Group>
							<Group gap='xs' onClick={(e) => e.stopPropagation()}>
								{onEdit && (
									<Tooltip label={translate('nikki.general.actions.edit')}>
										<ActionIcon variant='subtle' color='gray' size='sm' onClick={() => onEdit(game.id)}>
											<IconEdit size={14} />
										</ActionIcon>
									</Tooltip>
								)}
								{onDelete && (
									<Tooltip label={translate('nikki.general.actions.delete')}>
										<ActionIcon variant='subtle' color='red' size='sm' onClick={() => onDelete(game.id)}>
											<IconTrash size={14} />
										</ActionIcon>
									</Tooltip>
								)}
							</Group>
						</Group>

						{game.description && (
							<Text size='xs' c='dimmed' lineClamp={3}>
								{game.description}
							</Text>
						)}

						<Group gap='xs' wrap='nowrap'>
							{getStatusBadge(game.status)}
						</Group>

						{game.latestVersion && (
							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.games.fields.latestVersion')}: {game.latestVersion}
							</Text>
						)}

						{game.minAppVersion && (
							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.games.fields.minAppVersion')}: {game.minAppVersion}
							</Text>
						)}

						<Text size='xs' c='dimmed'>
							{translate('nikki.vendingMachine.games.fields.versions')}: {game.versions.length}
						</Text>

						<Text size='xs' c='dimmed'>
							{translate('nikki.vendingMachine.games.fields.createdAt')}: {new Date(game.createdAt).toLocaleDateString()}
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};
