
import { ActionIcon, Badge, Card, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash, IconPhoto } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Playlist } from '@/features/mediaPlaylist/types';


export interface MediaPlaylistCardProps {
	playlist: Playlist;
	isLoading?: boolean;
	onViewDetail: (playlistId: string) => void;
	onEdit?: (playlistId: string) => void;
	onDelete?: (playlistId: string) => void;
	cardProps?: React.ComponentProps<typeof Card>;
}

export const MediaPlaylistCard: React.FC<MediaPlaylistCardProps> = ({
	playlist,
	isLoading = false,
	onViewDetail,
	onEdit,
	onDelete,
	cardProps = {},
}) => {
	const { t: translate } = useTranslation();
	const archived = !!playlist.isArchived;

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	return (
		<Card
			key={playlist.id}
			shadow='sm'
			padding='lg'
			radius='md'
			withBorder
			style={{cursor: 'pointer'}}
			onClick={() => onViewDetail(playlist.id)}
			{...cardProps}
		>
			<Stack gap='sm'>
				<Group justify='space-between' align='flex-start'>
					<Group gap='xs'>
						<IconPhoto size={20} />
						<Text fw={600} size='sm'>{playlist.name}</Text>
					</Group>
					<Group gap='xs' onClick={(e) => e.stopPropagation()}>
						{onEdit && (
							<Tooltip label={translate('nikki.general.actions.edit')}>
								<ActionIcon variant='subtle' color='gray' size='sm' onClick={() => onEdit(playlist.id)}>
									<IconEdit size={14} />
								</ActionIcon>
							</Tooltip>
						)}
						{onDelete && (
							<Tooltip label={translate('nikki.general.actions.delete')}>
								<ActionIcon variant='subtle' color='red' size='sm' onClick={() => onDelete(playlist.id)}>
									<IconTrash size={14} />
								</ActionIcon>
							</Tooltip>
						)}
					</Group>
				</Group>

				{playlist.scopeRef && (
					<Text size='xs' c='dimmed' lineClamp={3}>
						{playlist.scopeRef}
					</Text>
				)}

				<Group gap='xs' wrap='nowrap'>
					<Badge color={archived ? 'gray' : 'green'} size='sm'>
						{archived
							? translate('nikki.vendingMachine.mediaPlaylist.archived.yes')
							: translate('nikki.vendingMachine.mediaPlaylist.archived.no')}
					</Badge>
				</Group>

				<Text size='xs' c='dimmed'>
					{translate('nikki.vendingMachine.mediaPlaylist.fields.createdAt')}: {new Date(playlist.createdAt).toLocaleDateString()}
				</Text>
			</Stack>
		</Card>
	);
};
