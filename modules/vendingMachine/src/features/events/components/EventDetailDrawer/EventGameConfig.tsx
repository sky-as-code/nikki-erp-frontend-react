import React from 'react';

import { GameConfig } from '@/components/GameConfig';

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
}) => (
	<GameConfig
		game={game}
		gameId={gameId}
		onChange={onGameChange}
		onRemove={onGameRemove}
	/>
);
