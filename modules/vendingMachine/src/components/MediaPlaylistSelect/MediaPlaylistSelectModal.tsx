/* eslint-disable max-lines-per-function */
import { Badge, Button, Card, Group, Modal, ScrollArea, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { playlistService } from '@/features/mediaPlaylist/playlistService';
import type { Playlist } from '@/features/mediaPlaylist/types';


export interface MediaPlaylistSelectModalProps {
	opened: boolean;
	onClose: () => void;
	onSelectPlaylists: (playlists: Playlist[]) => void;
	selectedPlaylistIds?: string[];
}

export const MediaPlaylistSelectModal: React.FC<MediaPlaylistSelectModalProps> = ({
	opened,
	onClose,
	onSelectPlaylists,
}) => {
	const { t: translate } = useTranslation();
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [selectedPlaylists, setSelectedPlaylists] = useState<Playlist[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [loadError, setLoadError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	React.useEffect(() => {
		if (!opened) return;
		setLoading(true);
		setLoadError(null);
		playlistService
			.searchPlaylists({ page: 1, size: 200, includeArchived: false })
			.then((res) => setPlaylists(res.items))
			.catch(() => setLoadError(translate('nikki.general.messages.error')))
			.finally(() => setLoading(false));
	}, [opened, translate]);

	const filteredPlaylists = useMemo(() => {
		if (!searchQuery.trim()) return playlists;
		const query = searchQuery.toLowerCase();
		return playlists.filter(
			(playlist) =>
				playlist.name.toLowerCase().includes(query) ||
				(playlist.scopeRef && String(playlist.scopeRef).toLowerCase().includes(query)),
		);
	}, [playlists, searchQuery]);

	const handleTogglePlaylist = (playlist: Playlist) => {
		setSelectedPlaylists([playlist]);
	};

	const handleConfirm = () => {
		onSelectPlaylists(selectedPlaylists);
		setSelectedPlaylists([]);
		setSearchQuery('');
		onClose();
	};

	const handleCancel = () => {
		setSelectedPlaylists([]);
		setSearchQuery('');
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={handleCancel}
			title={translate('nikki.vendingMachine.events.selectMediaPlaylists.title')}
			size='xl'
		>
			<Stack gap='md'>
				<TextInput
					placeholder={translate('nikki.vendingMachine.events.selectMediaPlaylists.searchPlaceholder')}
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
				/>

				{loadError && (
					<Text size='sm' c='red'>{loadError}</Text>
				)}

				{selectedPlaylists.length > 0 && (
					<Text size='sm' c='blue' fw={500}>
						{translate('nikki.vendingMachine.events.selectMediaPlaylists.selectedCount', { count: selectedPlaylists.length })}
					</Text>
				)}

				<ScrollArea h={400}>
					{loading ? (
						<Text size='sm' c='dimmed' ta='center' py='md'>
							{translate('nikki.general.messages.loading')}
						</Text>
					) : filteredPlaylists.length === 0 ? (
						<Text size='sm' c='dimmed' ta='center' py='md'>
							{translate('nikki.vendingMachine.mediaPlaylist.messages.no_playlists_found')}
						</Text>
					) : (
						<SimpleGrid cols={2} spacing='md'>
							{filteredPlaylists.map((playlist) => {
								const isSelected = selectedPlaylists.some((a) => a.id === playlist.id);
								const archived = !!playlist.isArchived;
								return (
									<Card
										key={playlist.id}
										withBorder
										p='sm'
										radius='md'
										style={{
											cursor: 'pointer',
											borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
											backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
										}}
										onClick={() => handleTogglePlaylist(playlist)}
									>
										<Stack gap='xs'>
											<Text size='sm' fw={500} lineClamp={2}>
												{playlist.name}
											</Text>
											<Text size='xs' c='dimmed' lineClamp={1}>
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
							})}
						</SimpleGrid>
					)}
				</ScrollArea>

				<Group justify='flex-end' gap='xs'>
					<Button variant='subtle' onClick={handleCancel}>
						{translate('nikki.general.actions.cancel')}
					</Button>
					<Button onClick={handleConfirm} disabled={selectedPlaylists.length === 0}>
						{translate('nikki.general.actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
