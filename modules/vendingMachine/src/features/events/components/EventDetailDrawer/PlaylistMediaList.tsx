import { ActionIcon, Badge, Box, Group, Stack, Table, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SlideshowPlaylist } from '../../types';


export interface PlaylistMediaListProps {
	playlist: SlideshowPlaylist;
	onRemoveMedia?: (mediaId: string) => void;
}

const PlaylistMediaListComponent: React.FC<PlaylistMediaListProps> = ({
	playlist,
	onRemoveMedia,
}) => {
	const { t: translate } = useTranslation();

	if (!playlist.media || playlist.media.length === 0) {
		return (
			<Text size='sm' c='dimmed'>
				{translate('nikki.vendingMachine.events.messages.no_media_in_playlist')}
			</Text>
		);
	}

	return (
		<Table>
			<Table.Thead>
				<Table.Tr>
					<Table.Th style={{ width: 50 }}>#</Table.Th>
					<Table.Th>{translate('nikki.vendingMachine.events.playlist.mediaType')}</Table.Th>
					<Table.Th>{translate('nikki.vendingMachine.events.playlist.thumbnail')}</Table.Th>
					<Table.Th>{translate('nikki.vendingMachine.events.playlist.duration')}</Table.Th>
					{onRemoveMedia && <Table.Th style={{ width: 50 }}></Table.Th>}
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{playlist.media
					.sort((a, b) => a.order - b.order)
					.map((item, index) => (
						<Table.Tr key={item.id}>
							<Table.Td>
								<Text size='sm'>{index + 1}</Text>
							</Table.Td>
							<Table.Td>
								<Badge size='sm' variant='light'>
									{item.type}
								</Badge>
							</Table.Td>
							<Table.Td>
								{item.thumbnailUrl ? (
									<Box w={40} h={40}>
										<img
											src={item.thumbnailUrl}
											alt='Thumbnail'
											style={{
												width: '100%',
												height: '100%',
												objectFit: 'cover',
												borderRadius: 4,
											}}
										/>
									</Box>
								) : (
									<Text size='xs' c='dimmed'>--</Text>
								)}
							</Table.Td>
							<Table.Td>
								<Text size='sm'>
									{item.duration ? `${item.duration}s` : '--'}
								</Text>
							</Table.Td>
							{onRemoveMedia && (
								<Table.Td>
									<ActionIcon
										variant='subtle'
										color='red'
										size='sm'
										onClick={() => onRemoveMedia(item.id)}
									>
										<IconTrash size={16} />
									</ActionIcon>
								</Table.Td>
							)}
						</Table.Tr>
					))}
			</Table.Tbody>
		</Table>
	);
};

export const PlaylistMediaList = PlaylistMediaListComponent;
