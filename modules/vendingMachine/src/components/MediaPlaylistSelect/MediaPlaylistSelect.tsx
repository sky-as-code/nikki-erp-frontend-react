
import { Box, Button, Card, Group, Text } from '@mantine/core';
import { IconPhoto, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type Playlist } from '@/features/mediaPlaylist/types';

import { MediaPlaylistSelectCard } from './MediaPlaylistSelectCard';
import { MediaPlaylistSelectModal } from './MediaPlaylistSelectModal';


export interface MediaPlaylistSelectProps {
	isEditing: boolean;
	type: 'waiting' | 'shopping';
	value: Playlist | null | undefined;
	onChange: (value: Playlist | undefined) => void;
	onRemove?: () => void;
}

export const MediaPlaylistSelect: React.FC<MediaPlaylistSelectProps> = ({
	isEditing,
	type,
	value,
	onChange,
	onRemove,
}) => {
	const { t: translate } = useTranslation();

	const [modalOpened, setModalOpened] = useState(false);

	const handleSelectPlaylists = (playlists: Playlist[]) => {
		if (playlists.length > 0) {
			onChange(playlists[0]);
		}
		setModalOpened(false);
	};

	return (
		<div>
			<Text size='sm' c='dimmed' mb={3} fw={500}>
				{translate(type === 'waiting'
					? 'nikki.vendingMachine.events.fields.idlePlaylist'
					: 'nikki.vendingMachine.events.fields.shoppingPlaylist')
				}
			</Text>
			{value ? (
				<MediaPlaylistSelectCard
					playlist={value}
					onRemove={onRemove}
				/>
			) : (
				<Card withBorder p='sm' radius='md'>
					<Group gap='xs' justify='space-between'>
						<Box>
							<Group gap='xs' mb='sm'>
								<IconPhoto size={20} />
								<Text size='sm' fw={500}>
									{translate(type === 'waiting'
										? 'nikki.vendingMachine.events.playlist.idleScreen'
										: 'nikki.vendingMachine.events.playlist.shoppingScreen')}
								</Text>
							</Group>
							<Text size='sm' c='dimmed'>
								{translate(type === 'waiting'
									? 'nikki.vendingMachine.events.messages.no_idle_playlist'
									: 'nikki.vendingMachine.events.messages.no_shopping_playlist')}
							</Text>
						</Box>
						{isEditing && (
							<Button
								size='xs'
								leftSection={<IconPlus size={14} />}
								onClick={() => setModalOpened(true)}
							>
								{translate('nikki.vendingMachine.events.playlist.selectMediaPlaylists')}
							</Button>
						)}
					</Group>
				</Card>
			)}

			<MediaPlaylistSelectModal
				opened={modalOpened}
				onClose={() => setModalOpened(false)}
				onSelectPlaylists={handleSelectPlaylists}
			/>
		</div>
	);
};
