/* eslint-disable max-lines-per-function */
import { Badge, Button, Card, Group, Modal, ScrollArea, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { IconDeviceGamepad2, IconSearch } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { mockGames } from '@/features/games/mockGames';
import { Game } from '@/features/games/types';



export interface GameSelectModalProps {
	opened: boolean;
	onClose: () => void;
	onSelectGame: (game: Game) => void;
	selectedGameId?: string;
}

export const GameSelectModal: React.FC<GameSelectModalProps> = ({
	opened,
	onClose,
	onSelectGame,
}) => {
	const { t: translate } = useTranslation();
	const [games, setGames] = useState<Game[]>([]);
	const [selectedGame, setSelectedGame] = useState<Game | undefined>();
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		if (opened) {
			mockGames.listGames().then(setGames);
		}
	}, [opened]);

	const filteredGames = useMemo(() => {
		if (!searchQuery.trim()) return games;
		const query = searchQuery.toLowerCase();
		return games.filter(
			(game) =>
				game.name.toLowerCase().includes(query) ||
				game.code.toLowerCase().includes(query) ||
				game.description?.toLowerCase().includes(query),
		);
	}, [games, searchQuery]);

	const handleSelectGame = (game: Game) => {
		setSelectedGame(game);
	};

	const handleConfirm = () => {
		if (selectedGame) {
			onSelectGame(selectedGame);
		}
		setSelectedGame(undefined);
		setSearchQuery('');
		onClose();
	};

	const handleCancel = () => {
		setSelectedGame(undefined);
		setSearchQuery('');
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={handleCancel}
			title={translate('nikki.vendingMachine.events.selectGame.title')}
			size='xl'
		>
			<Stack gap='md'>
				{/* Search */}
				<TextInput
					placeholder={translate('nikki.vendingMachine.events.selectGame.searchPlaceholder')}
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
				/>

				{/* Games Grid */}
				<ScrollArea h={400}>
					{filteredGames.length === 0 ? (
						<Text size='sm' c='dimmed' ta='center' py='md'>
							{translate('nikki.vendingMachine.events.selectGame.noGames')}
						</Text>
					) : (
						<SimpleGrid cols={2} spacing='md'>
							{filteredGames.map((game) => {
								const isSelected = selectedGame?.id === game.id;
								return (
									<Card
										key={game.id}
										withBorder
										p='sm'
										radius='md'
										style={{
											cursor: 'pointer',
											borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
											backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
										}}
										onClick={() => handleSelectGame(game)}
									>
										<Stack gap='xs'>
											<Group gap='xs' justify='space-between'>
												<Group gap='xs'>
													<IconDeviceGamepad2 size={20} />
													<Text size='sm' fw={500}>{game.name}</Text>
												</Group>
												<Badge size='sm'>{game.code}</Badge>
											</Group>
											{game.description && (
												<Text size='xs' c='dimmed' lineClamp={2}>
													{game.description}
												</Text>
											)}
											<Group gap='xs'>
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
							})}
						</SimpleGrid>
					)}
				</ScrollArea>

				{/* Actions */}
				<Group justify='flex-end' gap='xs'>
					<Button variant='subtle' onClick={handleCancel}>
						{translate('nikki.general.actions.cancel')}
					</Button>
					<Button onClick={handleConfirm} disabled={!selectedGame}>
						{translate('nikki.general.actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
