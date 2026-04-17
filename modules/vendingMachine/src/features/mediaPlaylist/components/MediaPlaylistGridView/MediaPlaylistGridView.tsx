/* eslint-disable max-lines-per-function */
import { Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { TablePagination, TablePaginationProps } from '@nikkierp/ui/components';
import { IconPhoto } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { TableAction } from '@/components/Table';

import { getMediaPlaylistTableActions, type MediaPlaylistTableActions } from '../MediaPlaylistTable';
import { ResourceScopeType, type Playlist } from '../../types';


export interface MediaPlaylistGridViewProps {
	playlists: Playlist[];
	isLoading?: boolean;
	actions: MediaPlaylistTableActions;
	pagination?: TablePaginationProps;
}

function scopeLabel(scope: string, translate: (key: string) => string): string {
	const key = `nikki.vendingMachine.mediaPlaylist.scopeType.${scope}` as const;
	const label = translate(key);
	return label === key ? scope : label;
}

export const MediaPlaylistGridView: React.FC<MediaPlaylistGridViewProps> = ({
	playlists,
	isLoading = false,
	actions,
	pagination,
}) => {
	const { t: translate } = useTranslation();
	const { view: onPreview, ...cardActions } = actions;

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (playlists.length === 0) {
		return <Text c='dimmed'>{translate('nikki.vendingMachine.mediaPlaylist.messages.no_playlists_found')}</Text>;
	}

	return (
		<Stack gap='md' pos='relative' mih={200}>
			<SimpleGrid
				cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
				spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
			>
				{playlists.map((playlist) => {
					const scope = String(playlist.scopeType || ResourceScopeType.DOMAIN);
					return (
						<Card
							key={playlist.id}
							shadow='sm'
							padding='lg'
							radius='md'
							withBorder
							style={{
								cursor: 'pointer',
							}}
							onClick={() => onPreview?.(playlist)}
						>
							<Stack gap='sm'>
								<Group justify='space-between' align='flex-start'>
									<Group gap='xs'>
										<IconPhoto size={20} />
										<Stack gap={0}>
											<Text fw={600} size='sm'>{playlist.name}</Text>
											<Text size='xs' c='dimmed'>{scopeLabel(scope, translate)}</Text>
										</Stack>
									</Group>
									<Group gap='xs' onClick={(e) => e.stopPropagation()}>
										<TableAction
											actions={getMediaPlaylistTableActions(playlist, cardActions, translate)}
											overflowMenuLabel={translate('nikki.general.actions.title')}
										/>
									</Group>
								</Group>

								{playlist.scopeRef && (
									<Text size='xs' c='dimmed' lineClamp={2}>
										{playlist.scopeRef}
									</Text>
								)}

								<Group gap='xs' wrap='nowrap'>
									<ArchivedStatusBadge isArchived={!!playlist.isArchived} />
								</Group>

								<Text size='xs' c='dimmed'>
									{translate('nikki.vendingMachine.mediaPlaylist.fields.createdAt')}: {new Date(playlist.createdAt).toLocaleDateString()}
								</Text>
							</Stack>
						</Card>
					);
				})}
			</SimpleGrid>
			{pagination ? <TablePagination {...pagination} /> : null}
		</Stack>
	);
};
