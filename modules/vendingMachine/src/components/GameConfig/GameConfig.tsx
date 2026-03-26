import { Box, Button, Card, Group, Text } from '@mantine/core';
import { IconDeviceGamepad2, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GamePreviewCard } from '@/features/events/components/EventDetailDrawer/GamePreviewCard';
import { GameSelectModal } from '@/features/events/components/EventDetailDrawer/GameSelectModal';
import { Game } from '@/features/games/types';


export interface GameConfigProps {
	game?: Game;
	gameId?: string;
	onChange?: (game: Game) => void;
	onRemove?: () => void;
}

export const GameConfig: React.FC<GameConfigProps> = ({
	game,
	gameId,
	onChange,
	onRemove,
}) => {
	const { t: translate } = useTranslation();
	const [gameSelectModalOpened, setGameSelectModalOpened] = useState(false);

	const handleSelectGame = (selectedGame: Game) => {
		onChange?.(selectedGame);
	};

	return (
		<div>
			<Text size='sm' c='dimmed' mb='xs' fw={500}>
				{translate('nikki.vendingMachine.events.fields.game')}
			</Text>
			{game ? (
				<GamePreviewCard
					game={game}
					onRemove={onRemove}
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
						{onChange && (
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

			<GameSelectModal
				opened={gameSelectModalOpened}
				onClose={() => setGameSelectModalOpened(false)}
				onSelectGame={handleSelectGame}
				selectedGameId={gameId || game?.id}
			/>
		</div>
	);
};
