import { Box, Button, Card, Group, Text } from '@mantine/core';
import { IconPhoto, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SlideshowCard } from '@/features/events/components/EventDetailDrawer/SlideshowCard';
import { SlideshowSelectModal } from '@/features/events/components/EventDetailDrawer/SlideshowSelectModal';

import type { Slideshow } from '@/features/slideshow/types';


export interface SlideshowSelectProps {
	type: 'waiting' | 'shopping';
	/** Controlled: slideshow hiển thị (đồng bộ với form id + kiosk + draft ở parent). */
	value: Slideshow | undefined;
	onChange: (value: Slideshow | undefined) => void;
	isEditing: boolean;
}

export const SlideshowSelect: React.FC<SlideshowSelectProps> = ({
	type,
	value,
	onChange,
	isEditing,
}) => {
	const { t: translate } = useTranslation();
	const [slideshowSelectModalOpened, setSlideshowSelectModalOpened] = useState(false);

	const handleSelectSlideshows = (slideshows: Slideshow[]) => {
		if (slideshows.length > 0) {
			onChange(slideshows[0]);
		}
		setSlideshowSelectModalOpened(false);
	};

	const handleRemove = () => {
		onChange(undefined);
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
				<SlideshowCard
					slideshow={value}
					onRemove={isEditing ? handleRemove : undefined}
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
								onClick={() => setSlideshowSelectModalOpened(true)}
							>
								{translate('nikki.vendingMachine.events.playlist.selectSlideshows')}
							</Button>
						)}
					</Group>
				</Card>
			)}

			<SlideshowSelectModal
				opened={slideshowSelectModalOpened}
				onClose={() => setSlideshowSelectModalOpened(false)}
				onSelectSlideshows={handleSelectSlideshows}
			/>
		</div>
	);
};
