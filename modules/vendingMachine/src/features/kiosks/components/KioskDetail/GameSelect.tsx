import { Box, Button, Card, Group, Text } from '@mantine/core';
import { IconDeviceGamepad2, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GamePreviewCard } from '@/features/events/components/EventDetailDrawer/GamePreviewCard';
import { GameSelectModal } from '@/features/events/components/EventDetailDrawer/GameSelectModal';

import type { Game } from '@/features/games/types';


export interface GameSelectProps {
	value: Game | undefined;
	onChange: (value: Game | undefined) => void;
	isEditing: boolean;
}

export const GameSelect: React.FC<GameSelectProps> = ({
	value,
	onChange,
	isEditing,
}) => {
	const { t: translate } = useTranslation();
	const [modalOpened, setModalOpened] = useState(false);

	return (
		<div>
			<Text size='sm' c='dimmed' mb={3} fw={500}>
				{translate('nikki.vendingMachine.events.fields.game')}
			</Text>
			{value ? (
				<GamePreviewCard
					game={value}
					onRemove={isEditing ? () => onChange(undefined) : undefined}
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
						{isEditing && (
							<Button
								size='xs'
								leftSection={<IconPlus size={14} />}
								onClick={() => setModalOpened(true)}
							>
								{translate('nikki.vendingMachine.events.selectGame.selectGame')}
							</Button>
						)}
					</Group>
				</Card>
			)}

			<GameSelectModal
				opened={modalOpened}
				onClose={() => setModalOpened(false)}
				onSelectGame={(game) => {
					onChange(game);
					setModalOpened(false);
				}}
			/>
		</div>
	);
};
