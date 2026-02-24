/* eslint-disable max-lines-per-function */
import { Badge, Button, Card, Group, Modal, ScrollArea, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch, IconVideo } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { mockAds } from '../../../ads/mockAds';
import { Ad } from '../../../ads/types';


export interface AdSelectModalProps {
	opened: boolean;
	onClose: () => void;
	onSelectAds: (ads: Ad[]) => void;
	selectedAdIds?: string[];
}

export const AdSelectModal: React.FC<AdSelectModalProps> = ({
	opened,
	onClose,
	onSelectAds,
}) => {
	const { t: translate } = useTranslation();
	const [ads, setAds] = useState<Ad[]>([]);
	const [selectedAds, setSelectedAds] = useState<Ad[]>([]);
	const [searchQuery, setSearchQuery] = useState('');

	React.useEffect(() => {
		if (opened) {
			mockAds.listAds().then(setAds);
		}
	}, [opened]);

	const filteredAds = useMemo(() => {
		if (!searchQuery.trim()) return ads;
		const query = searchQuery.toLowerCase();
		return ads.filter(
			(ad) =>
				ad.code.toLowerCase().includes(query) ||
				ad.name.toLowerCase().includes(query) ||
				ad.description?.toLowerCase().includes(query),
		);
	}, [ads, searchQuery]);

	const handleToggleAd = (ad: Ad) => {
		setSelectedAds([ad]);
	};

	const handleConfirm = () => {
		onSelectAds(selectedAds);
		setSelectedAds([]);
		setSearchQuery('');
		onClose();
	};

	const handleCancel = () => {
		setSelectedAds([]);
		setSearchQuery('');
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={handleCancel}
			title={translate('nikki.vendingMachine.events.selectAds.title')}
			size='xl'
		>
			<Stack gap='md'>
				{/* Search */}
				<TextInput
					placeholder={translate('nikki.vendingMachine.events.selectAds.searchPlaceholder')}
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
				/>

				{/* Selected Count */}
				{selectedAds.length > 0 && (
					<Text size='sm' c='blue' fw={500}>
						{translate('nikki.vendingMachine.events.selectAds.selectedCount', { count: selectedAds.length })}
					</Text>
				)}

				{/* Ads Grid */}
				<ScrollArea h={400}>
					{filteredAds.length === 0 ? (
						<Text size='sm' c='dimmed' ta='center' py='md'>
							{translate('nikki.vendingMachine.events.selectAds.noAds')}
						</Text>
					) : (
						<SimpleGrid cols={2} spacing='md'>
							{filteredAds.map((ad) => {
								const isSelected = selectedAds.some((a) => a.id === ad.id);
								const hasMedia = ad.media && ad.media.length > 0;
								const firstMedia = hasMedia ? ad.media[0] : null;

								return (
									<Card
										key={ad.id}
										withBorder
										p='sm'
										radius='md'
										style={{
											cursor: 'pointer',
											borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
											backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
										}}
										onClick={() => handleToggleAd(ad)}
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
												{ad.name}
											</Text>
											<Text size='xs' c='dimmed' lineClamp={2}>
												{ad.description || ad.code}
											</Text>
											<Group gap='xs'>
												<Badge size='sm' variant='light' color={ad.status === 'active' ? 'green' : 'gray'}>
													{ad.status}
												</Badge>
												{hasMedia && (
													<Badge size='sm' variant='light'>
														{ad.media.length} {translate('nikki.vendingMachine.events.selectAds.media')}
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
					<Button onClick={handleConfirm} disabled={selectedAds.length === 0}>
						{translate('nikki.general.actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
