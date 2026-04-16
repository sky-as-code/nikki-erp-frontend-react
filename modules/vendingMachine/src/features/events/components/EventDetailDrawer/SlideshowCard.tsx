import { ActionIcon, Badge, Card, Group, Stack, Text } from '@mantine/core';
import { IconTrash, IconVideo } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Slideshow } from '../../../slideshow/types';


export interface SlideshowCardProps {
	slideshow: Slideshow;
	onRemove?: () => void;
}

export const SlideshowCard: React.FC<SlideshowCardProps> = ({slideshow, onRemove}) => {
	const { t: translate } = useTranslation();

	return (
		<Card
			key={slideshow.id}
			withBorder
			p='sm'
			radius='md'
		>
			<Stack gap='xs'>
				{slideshow.media?.length > 0 && (
					<Card withBorder p={0} radius='sm' style={{ overflow: 'hidden' }}>
						{slideshow.media[0]?.type === 'video' ? (
							<Group justify='center' p='md' bg='gray.1'>
								<IconVideo size={40} color='var(--mantine-color-gray-6)' />
							</Group>
						) : (
							<img
								src={slideshow.media[0]?.thumbnailUrl || slideshow.media[0]?.url}
								alt={slideshow.media[0]?.name || slideshow.media[0]?.code || 'Ad thumbnail'}
								style={{
									width: '100%',
									height: 120,
									objectFit: 'cover',
								}}
							/>
						)}
					</Card>
				)}
				<Group justify='space-between' align='center'>
					<Text size='sm' fw={500} lineClamp={1}>
						{slideshow.name}
					</Text>
					{onRemove && (
						<ActionIcon
							variant='subtle'
							color='red'
							size='sm'
							onClick={onRemove}
						>
							<IconTrash size={16} />
						</ActionIcon>
					)}
				</Group>



				<Text size='xs' c='dimmed' lineClamp={2}>
					{slideshow.description || slideshow.code}
				</Text>
				<Group gap='xs'>
					<Badge size='sm' variant='light' color={slideshow.status === 'active' ? 'green' : 'gray'}>
						{slideshow.status}
					</Badge>
					{slideshow.media?.length > 0 && (
						<Badge size='sm' variant='light'>
							{slideshow.media?.length} {translate('nikki.vendingMachine.events.selectSlideshows.media')}
						</Badge>
					)}
				</Group>

			</Stack>
		</Card>
	);
};
