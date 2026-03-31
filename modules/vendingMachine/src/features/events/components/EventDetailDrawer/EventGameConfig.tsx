import React from 'react';

import { GameSelect } from '@/components/GameSelect';

import { Game } from '../../../games/types';


export interface EventGameConfigProps {
	game?: Game;
	gameId?: string;
	onGameChange?: (game: Game) => void;
	onGameRemove?: () => void;
}

export const EventGameConfig: React.FC<EventGameConfigProps> = ({
	game,
	onGameChange,
	onGameRemove,
}) => (
	<GameSelect
		value={game}
		onChange={(v) => {
			if (v) {
				onGameChange?.(v);
			}
			else {
				onGameRemove?.();
			}
		}}
		isEditing={Boolean(onGameChange)}
	/>
);
