import { Box, Button, Card, Group, Text } from '@mantine/core';
import { IconPhoto, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SlideshowCard } from '@/features/events/components/EventDetailDrawer/SlideshowCard';
import { SlideshowSelectModal } from '@/features/events/components/EventDetailDrawer/SlideshowSelectModal';
import { Slideshow } from '@/features/slideshow/types';


export type SlideShowConfigVariant = 'idle' | 'shopping';

export interface SlideShowConfigProps {
	variant: SlideShowConfigVariant;
	slideshow?: Slideshow;
	onChange?: (slideshow: Slideshow) => void;
	onRemove?: () => void;
}

export const SlideShowConfig: React.FC<SlideShowConfigProps> = ({
	variant,
	slideshow,
	onChange,
	onRemove = () => {},
}) => {
	const { t: translate } = useTranslation();
	const [slideshowSelectModalOpened, setSlideshowSelectModalOpened] = useState(false);

	const fieldKey =
		variant === 'idle'
			? 'nikki.vendingMachine.events.fields.idlePlaylist'
			: 'nikki.vendingMachine.events.fields.shoppingPlaylist';
	const playlistTitleKey =
		variant === 'idle'
			? 'nikki.vendingMachine.events.playlist.idleScreen'
			: 'nikki.vendingMachine.events.playlist.shoppingScreen';
	const emptyMessageKey =
		variant === 'idle'
			? 'nikki.vendingMachine.events.messages.no_idle_playlist'
			: 'nikki.vendingMachine.events.messages.no_shopping_playlist';

	const handleSelectSlideshows = (slideshows: Slideshow[]) => {
		onChange?.(slideshows[0]);
	};

	return (
		<div>
			<Text size='sm' c='dimmed' mb='xs' fw={500}>
				{translate(fieldKey)}
			</Text>
			{slideshow ? (
				<SlideshowCard slideshow={slideshow} onRemove={onRemove} />
			) : (
				<Card withBorder p='sm' radius='md'>
					<Group gap='xs' justify='space-between'>
						<Box>
							<Group gap='xs' mb='sm'>
								<IconPhoto size={20} />
								<Text size='sm' fw={500}>
									{translate(playlistTitleKey)}
								</Text>
							</Group>

							<Text size='sm' c='dimmed'>
								{translate(emptyMessageKey)}
							</Text>
						</Box>
						{onChange && (
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
