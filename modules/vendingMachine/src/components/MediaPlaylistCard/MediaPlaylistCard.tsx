
import { ActionIcon, Badge, Card, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash, IconPhoto } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { MediaPlaylist, MediaPlayListStatus } from '@/features/slideshow/types';


export interface MediaPlaylistCardProps {
	playlist: MediaPlaylist;
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

	const getStatusBadge = (status: MediaPlayListStatus) => {
		const statusMap = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
			deleted: { color: 'red', label: translate('nikki.general.status.deleted') },
		};
		const statusInfo = statusMap[status];
		return <Badge color={statusInfo.color} size='sm'>{statusInfo.label}</Badge>;
	};

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
						<Text fw={600} size='sm'>{playlist.title}</Text>
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

				{playlist.description && (
					<Text size='xs' c='dimmed' lineClamp={3}>
						{playlist.description}
					</Text>
				)}

				<Group gap='xs' wrap='nowrap'>
					{getStatusBadge(playlist.status)}
				</Group>

				<Text size='xs' c='dimmed'>
					{translate('nikki.vendingMachine.mediaPlaylist.fields.createdAt')}: {new Date(playlist.createdAt).toLocaleDateString()}
				</Text>
			</Stack>
		</Card>
	);
};
