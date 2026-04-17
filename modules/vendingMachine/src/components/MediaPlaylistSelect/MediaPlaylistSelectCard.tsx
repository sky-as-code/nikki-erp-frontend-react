import { ActionIcon, Badge, Card, Group, Stack, Text } from '@mantine/core';
import { IconPhoto, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Playlist } from '@/features/mediaPlaylist/types';


export interface MediaPlaylistSelectCardProps {
	playlist?: Playlist | null;
	onRemove?: () => void;
}

export const MediaPlaylistSelectCard: React.FC<MediaPlaylistSelectCardProps> = ({ playlist, onRemove }) => {
	const { t: translate } = useTranslation();

	if (!playlist) {
		return null;
	}

	const archived = !!playlist.isArchived;

	return (
		<Card
			key={playlist.id}
			withBorder
			p='sm'
			radius='md'
		>
			<Stack gap='xs'>
				<Card withBorder p='md' radius='sm' bg='gray.0'>
					<Group justify='center'>
						<IconPhoto size={40} color='var(--mantine-color-gray-6)' />
					</Group>
				</Card>
				<Group justify='space-between' align='center'>
					<Text size='sm' fw={500} lineClamp={1}>
						{playlist.name}
					</Text>
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

				<Text size='xs' c='dimmed' lineClamp={2}>
					{playlist.scopeType}
					{playlist.scopeRef ? ` · ${playlist.scopeRef}` : ''}
				</Text>
				<Group gap='xs'>
					<Badge size='sm' variant='filled' color={archived ? 'gray' : 'green'}>
						{archived
							? translate('nikki.vendingMachine.mediaPlaylist.archived.yes')
							: translate('nikki.vendingMachine.mediaPlaylist.archived.no')}
					</Badge>
				</Group>
			</Stack>
		</Card>
	);
};
