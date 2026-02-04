import { ActionIcon, Badge, Card, Group, Stack, Text } from '@mantine/core';
import { IconTrash, IconVideo } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Ad } from '../../../ads/types';


export interface AdCardProps {
	ad: Ad;
	onRemove?: () => void;
}

export const AdCard: React.FC<AdCardProps> = ({ad, onRemove}) => {
	const { t: translate } = useTranslation();

	return (
		<Card
			key={ad.id}
			withBorder
			p='sm'
			radius='md'
		>
			<Stack gap='xs'>
				{ad.media.length > 0 && (
					<Card withBorder p={0} radius='sm' style={{ overflow: 'hidden' }}>
						{ad.media[0].type === 'video' ? (
							<Group justify='center' p='md' bg='gray.1'>
								<IconVideo size={40} color='var(--mantine-color-gray-6)' />
							</Group>
						) : (
							<img
								src={ad.media[0].thumbnailUrl || ad.media[0].url}
								alt={ad.media[0].name || ad.media[0].code || 'Ad thumbnail'}
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
						{ad.name}
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
					{ad.description || ad.code}
				</Text>
				<Group gap='xs'>
					<Badge size='sm' variant='light' color={ad.status === 'active' ? 'green' : 'gray'}>
						{ad.status}
					</Badge>
					{ad.media.length > 0 && (
						<Badge size='sm' variant='light'>
							{ad.media.length} {translate('nikki.vendingMachine.events.selectAds.media')}
						</Badge>
					)}
				</Group>

			</Stack>
		</Card>
	);
};
