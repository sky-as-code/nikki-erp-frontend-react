import { Box, Button, Card, Group, Stack, Text } from '@mantine/core';
import { IconDeviceGamepad2, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GamePreviewCard } from './GamePreviewCard';
import { GameSelectModal } from './GameSelectModal';
import { Game } from '../../../games/types';


export interface EventGameConfigProps {
	game?: Game;
	gameId?: string;
	onGameChange?: (game: Game) => void;
	onGameRemove?: () => void;
}

export const EventGameConfig: React.FC<EventGameConfigProps> = ({
	game,
	gameId,
	onGameChange,
	onGameRemove,
}) => {
	const { t: translate } = useTranslation();
	const [gameSelectModalOpened, setGameSelectModalOpened] = useState(false);

	const handleSelectGame = (selectedGame: Game) => {
		if (onGameChange) {
			onGameChange(selectedGame);
		}
	};

	return (
		<Stack gap='md'>
			{/* Game Selection */}
			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.events.fields.game')}
				</Text>
				{game ? (
					<GamePreviewCard
						game={game}
						onRemove={onGameRemove}
					/>
				) : (
					<Card withBorder p='sm' radius='md'>
						<Group gap='xs' justify='space-between'>
							<Box>
								<Group gap='xs' mb='sm'>
									<IconDeviceGamepad2 size={20} />
									<Text size='sm' fw={500}>
										{translate('nikki.vendingMachine.events.fields.game')}
									</Text>
								</Group>

								<Text size='sm' c='dimmed'>
									{translate('nikki.vendingMachine.events.messages.no_game')}
								</Text>
							</Box>
							{onGameChange && (
								<Button
									size='xs'
									leftSection={<IconPlus size={14} />}
									onClick={() => setGameSelectModalOpened(true)}
								>
									{translate('nikki.vendingMachine.events.selectGame.selectGame')}
								</Button>
							)}
						</Group>
					</Card>
				)}
			</div>

			{/* Game Select Modal */}
			<GameSelectModal
				opened={gameSelectModalOpened}
				onClose={() => setGameSelectModalOpened(false)}
				onSelectGame={handleSelectGame}
				selectedGameId={gameId || game?.id}
			/>
		</Stack>
	);
};
