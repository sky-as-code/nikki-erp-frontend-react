/* eslint-disable max-lines-per-function */
import { Badge, Button, Card, Group, Modal, ScrollArea, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch, IconVideo } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { mockSlideshows } from '@/features/slideshow/mockSlideshows';
import { Slideshow } from '@/features/slideshow/types';


export interface SlideshowSelectModalProps {
	opened: boolean;
	onClose: () => void;
	onSelectSlideshows: (slideshows: Slideshow[]) => void;
	selectedSlideshowIds?: string[];
}

export const SlideshowSelectModal: React.FC<SlideshowSelectModalProps> = ({
	opened,
	onClose,
	onSelectSlideshows,
}) => {
	const { t: translate } = useTranslation();
	const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
	const [selectedSlideshows, setSelectedSlideshows] = useState<Slideshow[]>([]);
	const [searchQuery, setSearchQuery] = useState('');

	React.useEffect(() => {
		if (opened) {
			mockSlideshows.listSlideshows().then(setSlideshows);
		}
	}, [opened]);

	const filteredSlideshows = useMemo(() => {
		if (!searchQuery.trim()) return slideshows;
		const query = searchQuery.toLowerCase();
		return slideshows.filter(
			(slideshow) =>
				slideshow.code.toLowerCase().includes(query) ||
				slideshow.name.toLowerCase().includes(query) ||
				slideshow.description?.toLowerCase().includes(query),
		);
	}, [slideshows, searchQuery]);

	const handleToggleSlideshow = (slideshow: Slideshow) => {
		setSelectedSlideshows([slideshow]);
	};

	const handleConfirm = () => {
		onSelectSlideshows(selectedSlideshows);
		setSelectedSlideshows([]);
		setSearchQuery('');
		onClose();
	};

	const handleCancel = () => {
		setSelectedSlideshows([]);
		setSearchQuery('');
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={handleCancel}
			title={translate('nikki.vendingMachine.events.selectSlideshows.title')}
			size='xl'
		>
			<Stack gap='md'>
				{/* Search */}
				<TextInput
					placeholder={translate('nikki.vendingMachine.events.selectSlideshows.searchPlaceholder')}
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
				/>

				{/* Selected Count */}
				{selectedSlideshows.length > 0 && (
					<Text size='sm' c='blue' fw={500}>
						{translate('nikki.vendingMachine.events.selectSlideshows.selectedCount', { count: selectedSlideshows.length })}
					</Text>
				)}

				{/* Slideshows Grid */}
				<ScrollArea h={400}>
					{filteredSlideshows.length === 0 ? (
						<Text size='sm' c='dimmed' ta='center' py='md'>
							{translate('nikki.vendingMachine.slideshow.messages.no_playlists_found')}
						</Text>
					) : (
						<SimpleGrid cols={2} spacing='md'>
							{filteredSlideshows.map((slideshow) => {
								const isSelected = selectedSlideshows.some((a) => a.id === slideshow.id);
								const hasMedia = slideshow.media && slideshow.media.length > 0;
								const firstMedia = hasMedia ? slideshow.media[0] : null;

								return (
									<Card
										key={slideshow.id}
										withBorder
										p='sm'
										radius='md'
										style={{
											cursor: 'pointer',
											borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
											backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
										}}
										onClick={() => handleToggleSlideshow(slideshow)}
									>
										<Stack gap='xs'>
											{firstMedia && (
												<Card withBorder p={0} radius='sm' style={{ overflow: 'hidden' }}>
													{firstMedia.type === 'video' ? (
														<Group justify='center' p='md' bg='gray.1'>
															<IconVideo size={40} color='var(--mantine-color-gray-6)' />
														</Group>
													) : (
														<img
															src={firstMedia.thumbnailUrl || firstMedia.url}
															alt={firstMedia.name}
															style={{
																width: '100%',
																height: 120,
																objectFit: 'cover',
															}}
														/>
													)}
												</Card>
											)}
											<Text size='sm' fw={500} lineClamp={1}>
												{slideshow.name}
											</Text>
											<Text size='xs' c='dimmed' lineClamp={2}>
												{slideshow.description || slideshow.code}
											</Text>
											<Group gap='xs'>
												<Badge size='sm' variant='filled' color={slideshow.status === 'active' ? 'green' : 'gray'}>
													{slideshow.status}
												</Badge>
												{hasMedia && (
													<Badge size='sm' variant='filled'>
														{slideshow.media.length} {translate('nikki.vendingMachine.events.selectSlideshows.media')}
													</Badge>
												)}
											</Group>
										</Stack>
									</Card>
								);
							})}
						</SimpleGrid>
					)}
				</ScrollArea>

				{/* Actions */}
				<Group justify='flex-end' gap='xs'>
					<Button variant='subtle' onClick={handleCancel}>
						{translate('nikki.general.actions.cancel')}
					</Button>
					<Button onClick={handleConfirm} disabled={selectedSlideshows.length === 0}>
						{translate('nikki.general.actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
