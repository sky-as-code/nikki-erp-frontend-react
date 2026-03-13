/* eslint-disable max-lines-per-function */
import {
	ActionIcon,
	Badge,
	Box,
	Button,
	FileButton,
	Group,
	Modal,
	NumberInput,
	ScrollArea,
	SimpleGrid,
	Stack,
	Table,
	Tabs,
	Text,
	Tooltip,
} from '@mantine/core';
import { IconFolder, IconGrid3x3, IconList, IconPhoto, IconTrash, IconUpload, IconVideo } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { mockGallery } from '../../mockGallery';
import { GalleryFolder, GalleryMedia } from '../../types';
import { MediaPreview } from '../MediaPreview';


export interface MediaGalleryModalProps {
	opened: boolean;
	onClose: () => void;
	onSelectMedia: (media: GalleryMedia[]) => void;
	selectedMediaIds?: string[]; // Already selected media IDs
}

type ViewMode = 'grid' | 'list';

const FolderTreeItem: React.FC<{
	folder: GalleryFolder;
	selectedFolderId?: string;
	onSelectFolder: (folderId: string) => void;
	level?: number;
}> = ({ folder, selectedFolderId, onSelectFolder, level = 0 }) => {
	const isSelected = selectedFolderId === folder.id;
	const hasChildren = folder.children && folder.children.length > 0;

	return (
		<>
			<Box
				onClick={() => onSelectFolder(folder.id)}
				style={{
					padding: '8px 12px',
					paddingLeft: `${12 + level * 20}px`,
					cursor: 'pointer',
					backgroundColor: isSelected ? '#e7f5ff' : 'transparent',
					borderRadius: 4,
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					'&:hover': {
						backgroundColor: '#f1f3f5',
					},
				}}
			>
				<IconFolder size={16} color={isSelected ? '#228be6' : '#868e96'} />
				<Text size='sm' fw={isSelected ? 600 : 400} c={isSelected ? '#228be6' : undefined}>
					{folder.name}
				</Text>
				{folder.mediaCount !== undefined && (
					<Badge size='xs' variant='light' color='gray'>
						{folder.mediaCount}
					</Badge>
				)}
			</Box>
			{hasChildren &&
				folder.children!.map((child) => (
					<FolderTreeItem
						key={child.id}
						folder={child}
						selectedFolderId={selectedFolderId}
						onSelectFolder={onSelectFolder}
						level={level + 1}
					/>
				))}
		</>
	);
};

export const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({
	opened,
	onClose,
	onSelectMedia,
	selectedMediaIds = [],
}) => {
	const { t: translate } = useTranslation();
	const [folders, setFolders] = useState<GalleryFolder[]>([]);
	const [media, setMedia] = useState<GalleryMedia[]>([]);
	const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const [selectedMedia, setSelectedMedia] = useState<GalleryMedia[]>([]);
	const [mediaDurations, setMediaDurations] = useState<Record<string, number>>({});
	const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');

	// Load folders and media on mount
	React.useEffect(() => {
		if (opened) {
			mockGallery.getFolders().then(setFolders);
			mockGallery.getAllMedia().then(setMedia);
		}
	}, [opened]);

	// Filter media by selected folder
	const filteredMedia = useMemo(() => {
		if (!selectedFolderId) {
			return media;
		}
		return media.filter((m) => m.folderId === selectedFolderId);
	}, [media, selectedFolderId]);

	const handleSelectFolder = (folderId: string) => {
		setSelectedFolderId(folderId === selectedFolderId ? undefined : folderId);
	};

	const handleToggleMedia = (mediaItem: GalleryMedia) => {
		setSelectedMedia((prev) => {
			const exists = prev.find((m) => m.id === mediaItem.id);
			if (exists) {
				// Remove duration when unselecting
				setMediaDurations((durations) => {
					const newDurations = { ...durations };
					delete newDurations[mediaItem.id];
					return newDurations;
				});
				return prev.filter((m) => m.id !== mediaItem.id);
			}
			// Set default duration for images (5 seconds) if not set
			if (mediaItem.type === 'image' && !mediaDurations[mediaItem.id]) {
				setMediaDurations((durations) => ({
					...durations,
					[mediaItem.id]: mediaItem.duration || 5,
				}));
			}
			return [...prev, mediaItem];
		});
	};

	const handleDurationChange = (mediaId: string, duration: number | string) => {
		const numDuration = typeof duration === 'string' ? parseFloat(duration) || 0 : duration;
		setMediaDurations((prev) => ({
			...prev,
			[mediaId]: numDuration,
		}));
	};

	const handleConfirm = () => {
		// Map selected media with custom durations
		const mediaWithDurations = selectedMedia.map((item) => ({
			...item,
			duration: mediaDurations[item.id] ?? item.duration,
		}));
		onSelectMedia(mediaWithDurations);
		setSelectedMedia([]);
		setMediaDurations({});
		setSelectedFolderId(undefined);
		onClose();
	};

	const handleCancel = () => {
		setSelectedMedia([]);
		setMediaDurations({});
		setSelectedFolderId(undefined);
		onClose();
	};

	const formatDuration = (seconds?: number) => {
		if (!seconds) return '-';
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const formatFileSize = (bytes?: number) => {
		if (!bytes) return '-';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	return (
		<Modal
			opened={opened}
			onClose={handleCancel}
			title={translate('nikki.vendingMachine.ads.media.gallery.title')}
			size='xl'
			overlayProps={{ opacity: 0.5, blur: 4 }}
		>
			<Tabs value={activeTab} onChange={(value) => setActiveTab(value as 'gallery' | 'upload')}>
				<Tabs.List>
					<Tabs.Tab value='gallery' leftSection={<IconGrid3x3 size={16} />}>
						{translate('nikki.vendingMachine.ads.media.gallery.tab')}
					</Tabs.Tab>
					<Tabs.Tab value='upload' leftSection={<IconUpload size={16} />}>
						{translate('nikki.vendingMachine.ads.media.upload.tab')}
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='gallery' pt='md'>
					<Group align='flex-start' gap='md'>
						{/* Folder Tree */}
						<Box
							style={{
								width: 250,
								border: '1px solid #e9ecef',
								borderRadius: 8,
								padding: 8,
								backgroundColor: '#f8f9fa',
							}}
						>
							<Text size='sm' fw={600} mb='xs' px='xs'>
								{translate('nikki.vendingMachine.ads.media.gallery.folders')}
							</Text>
							<ScrollArea h={400}>
								<Stack gap={2}>
									<Box
										onClick={() => handleSelectFolder('')}
										style={{
											padding: '8px 12px',
											cursor: 'pointer',
											backgroundColor: !selectedFolderId ? '#e7f5ff' : 'transparent',
											borderRadius: 4,
											display: 'flex',
											alignItems: 'center',
											gap: 8,
										}}
									>
										<IconFolder size={16} />
										<Text size='sm' fw={!selectedFolderId ? 600 : 400}>
											{translate('nikki.vendingMachine.ads.media.gallery.all')}
										</Text>
									</Box>
									{folders.map((folder) => (
										<FolderTreeItem
											key={folder.id}
											folder={folder}
											selectedFolderId={selectedFolderId}
											onSelectFolder={handleSelectFolder}
										/>
									))}
								</Stack>
							</ScrollArea>
						</Box>

						{/* Media List/Grid */}
						<Box style={{ flex: 1 }}>
							<Group justify='space-between' mb='md'>
								<Text size='sm' c='dimmed'>
									{filteredMedia.length} {translate('nikki.vendingMachine.ads.media.gallery.items')}
								</Text>
								<Group gap='xs'>
									<Tooltip label={translate('nikki.vendingMachine.ads.media.gallery.gridView')}>
										<ActionIcon
											variant={viewMode === 'grid' ? 'filled' : 'subtle'}
											onClick={() => setViewMode('grid')}
										>
											<IconGrid3x3 size={18} />
										</ActionIcon>
									</Tooltip>
									<Tooltip label={translate('nikki.vendingMachine.ads.media.gallery.listView')}>
										<ActionIcon
											variant={viewMode === 'list' ? 'filled' : 'subtle'}
											onClick={() => setViewMode('list')}
										>
											<IconList size={18} />
										</ActionIcon>
									</Tooltip>
								</Group>
							</Group>

							<ScrollArea h={400}>
								{viewMode === 'grid' ? (
									<SimpleGrid cols={3} spacing='md'>
										{filteredMedia.map((item) => {
											const isSelected = selectedMedia.some((m) => m.id === item.id);
											const isAlreadySelected = selectedMediaIds.includes(item.id);
											return (
												<Box
													key={item.id}
													onClick={() => !isAlreadySelected && handleToggleMedia(item)}
													style={{
														cursor: isAlreadySelected ? 'not-allowed' : 'pointer',
														border: `2px solid ${isSelected ? '#228be6' : isAlreadySelected ? '#ff6b6b' : '#e9ecef'}`,
														borderRadius: 8,
														padding: 8,
														backgroundColor: isSelected ? '#e7f5ff' : isAlreadySelected ? '#fff5f5' : 'white',
														opacity: isAlreadySelected ? 0.6 : 1,
													}}
												>
													<Stack gap='xs'>
														<Box style={{ position: 'relative' }}>
															<MediaPreview
																media={{
																	id: item.id,
																	code: item.code,
																	name: item.name,
																	type: item.type,
																	url: item.url,
																	thumbnailUrl: item.thumbnailUrl,
																	duration: item.duration,
																	order: 0,
																}}
																size='md'
															/>
															{isSelected && (
																<Badge
																	color='blue'
																	style={{
																		position: 'absolute',
																		top: 4,
																		right: 4,
																	}}
																>
																	✓
																</Badge>
															)}
															{isAlreadySelected && (
																<Badge
																	color='red'
																	style={{
																		position: 'absolute',
																		top: 4,
																		right: 4,
																	}}
																>
																	{translate('nikki.vendingMachine.ads.media.gallery.selected')}
																</Badge>
															)}
														</Box>
														<Text size='xs' fw={500} lineClamp={1}>
															{item.name}
														</Text>
														<Group gap='xs' justify='space-between'>
															<Badge size='xs' color={item.type === 'image' ? 'blue' : 'red'}>
																{item.type === 'image' ? (
																	<IconPhoto size={12} />
																) : (
																	<IconVideo size={12} />
																)}
															</Badge>
															{item.duration && (
																<Text size='xs' c='dimmed'>
																	{formatDuration(item.duration)}
																</Text>
															)}
														</Group>
													</Stack>
												</Box>
											);
										})}
									</SimpleGrid>
								) : (
									<Table>
										<Table.Thead>
											<Table.Tr>
												<Table.Th style={{ width: 50 }}></Table.Th>
												<Table.Th>{translate('nikki.vendingMachine.ads.media.fields.preview')}</Table.Th>
												<Table.Th>{translate('nikki.vendingMachine.ads.media.fields.code')}</Table.Th>
												<Table.Th>{translate('nikki.vendingMachine.ads.media.fields.name')}</Table.Th>
												<Table.Th>{translate('nikki.vendingMachine.ads.media.fields.type')}</Table.Th>
												<Table.Th>{translate('nikki.vendingMachine.ads.media.fields.duration')}</Table.Th>
												<Table.Th>{translate('nikki.vendingMachine.ads.media.fields.size')}</Table.Th>
											</Table.Tr>
										</Table.Thead>
										<Table.Tbody>
											{filteredMedia.map((item) => {
												const isSelected = selectedMedia.some((m) => m.id === item.id);
												const isAlreadySelected = selectedMediaIds.includes(item.id);
												return (
													<Table.Tr
														key={item.id}
														onClick={() => !isAlreadySelected && handleToggleMedia(item)}
														style={{
															cursor: isAlreadySelected ? 'not-allowed' : 'pointer',
															backgroundColor: isSelected ? '#e7f5ff' : isAlreadySelected ? '#fff5f5' : undefined,
															opacity: isAlreadySelected ? 0.6 : 1,
														}}
													>
														<Table.Td>
															{isSelected && <Text c='blue'>✓</Text>}
															{isAlreadySelected && (
																<Text c='red' size='xs'>
																	{translate('nikki.vendingMachine.ads.media.gallery.selected')}
																</Text>
															)}
														</Table.Td>
														<Table.Td>
															<MediaPreview
																media={{
																	id: item.id,
																	code: item.code,
																	name: item.name,
																	type: item.type,
																	url: item.url,
																	thumbnailUrl: item.thumbnailUrl,
																	duration: item.duration,
																	order: 0,
																}}
																size='sm'
															/>
														</Table.Td>
														<Table.Td>
															<Text size='sm' fw={500}>{item.code}</Text>
														</Table.Td>
														<Table.Td>
															<Text size='sm'>{item.name}</Text>
														</Table.Td>
														<Table.Td>
															<Badge size='sm' color={item.type === 'image' ? 'blue' : 'red'}>
																{item.type === 'image' ? (
																	<IconPhoto size={12} />
																) : (
																	<IconVideo size={12} />
																)}
															</Badge>
														</Table.Td>
														<Table.Td>
															<Text size='sm'>{formatDuration(item.duration)}</Text>
														</Table.Td>
														<Table.Td>
															<Text size='sm'>{formatFileSize(item.size)}</Text>
														</Table.Td>
													</Table.Tr>
												);
											})}
										</Table.Tbody>
									</Table>
								)}
							</ScrollArea>
						</Box>
					</Group>
				</Tabs.Panel>

				<Tabs.Panel value='upload' pt='md'>
					<Stack gap='md'>
						<Text size='sm' c='dimmed'>
							{translate('nikki.vendingMachine.ads.media.upload.description')}
						</Text>
						<FileButton
							onChange={(files) => {
								// TODO: Handle file upload
								console.log('Files to upload:', files);
							}}
							accept='image/*,video/*'
							multiple
						>
							{(props) => (
								<Button {...props} leftSection={<IconUpload size={16} />}>
									{translate('nikki.vendingMachine.ads.media.upload.button')}
								</Button>
							)}
						</FileButton>
					</Stack>
				</Tabs.Panel>
			</Tabs>

			{selectedMedia.length > 0 && (
				<Stack gap='md' mt='md' pt='md' style={{ borderTop: '1px solid #e9ecef' }}>
					<Text size='sm' fw={500}>
						{translate('nikki.vendingMachine.ads.media.gallery.selectedMedia')} ({selectedMedia.length})
					</Text>
					<ScrollArea h={200}>
						<Stack gap='sm'>
							{selectedMedia.map((item) => (
								<Group key={item.id} gap='md' align='flex-start' wrap='nowrap'>
									<MediaPreview
										media={{
											id: item.id,
											code: item.code,
											name: item.name,
											type: item.type,
											url: item.url,
											thumbnailUrl: item.thumbnailUrl,
											duration: mediaDurations[item.id] ?? item.duration,
											order: 0,
										}}
										size='sm'
									/>
									<Stack gap='xs' style={{ flex: 1 }}>
										<Text size='sm' fw={500} lineClamp={1}>
											{item.name}
										</Text>
										<Group gap='xs' align='center'>
											<Text size='xs' c='dimmed' style={{ minWidth: 80 }}>
												{translate('nikki.vendingMachine.ads.media.fields.duration')}:
											</Text>
											<NumberInput
												size='xs'
												value={mediaDurations[item.id] ?? item.duration ?? (item.type === 'image' ? 5 : undefined)}
												onChange={(value) => handleDurationChange(item.id, value ?? 0)}
												min={1}
												max={3600}
												step={1}
												suffix=' giây'
												style={{ width: 120 }}
												required
											/>
										</Group>
									</Stack>
									<ActionIcon
										variant='subtle'
										color='red'
										size='sm'
										onClick={() => handleToggleMedia(item)}
									>
										<IconTrash size={16} />
									</ActionIcon>
								</Group>
							))}
						</Stack>
					</ScrollArea>
					<Group justify='flex-end' gap='xs'>
						<Button variant='subtle' onClick={handleCancel}>
							{translate('nikki.general.actions.cancel')}
						</Button>
						<Button onClick={handleConfirm}>
							{translate('nikki.general.actions.add')} ({selectedMedia.length})
						</Button>
					</Group>
				</Stack>
			)}
		</Modal>
	);
};
