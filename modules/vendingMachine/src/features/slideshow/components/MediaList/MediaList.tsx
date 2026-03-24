import { ActionIcon, Badge, Button, Group, Stack, Table, Text, Tooltip } from '@mantine/core';
import { IconPlus, IconTrash, IconGripVertical } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SlideshowMedia } from '../../types';
import { MediaPreview } from '../MediaPreview';


export interface MediaListProps {
	media: SlideshowMedia[];
	onAddMedia: () => void;
	onRemoveMedia: (mediaId: string) => void;
	onReorder?: (fromIndex: number, toIndex: number) => void;
}

const formatDuration = (seconds?: number) => {
	if (!seconds) return '-';
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const MediaList: React.FC<MediaListProps> = ({
	media,
	onAddMedia,
	onRemoveMedia,
}) => {
	const { t: translate } = useTranslation();

	if (media.length === 0) {
		return (
			<Stack gap='md'>
				<Group justify='space-between'>
					<Text size='sm' fw={500}>
						{translate('nikki.vendingMachine.slideshow.media.title')}
					</Text>
					<Button
						size='xs'
						leftSection={<IconPlus size={16} />}
						onClick={onAddMedia}
					>
						{translate('nikki.vendingMachine.slideshow.media.add')}
					</Button>
				</Group>
				<Text size='sm' c='dimmed' ta='center' py='xl'>
					{translate('nikki.vendingMachine.slideshow.media.empty')}
				</Text>
			</Stack>
		);
	}

	return (
		<Stack gap='md'>
			<Group justify='space-between'>
				<Text size='sm' fw={500}>
					{translate('nikki.vendingMachine.slideshow.media.title')} ({media.length})
				</Text>
				<Button
					size='xs'
					leftSection={<IconPlus size={16} />}
					onClick={onAddMedia}
				>
					{translate('nikki.vendingMachine.slideshow.media.add')}
				</Button>
			</Group>

			<Table>
				<Table.Thead>
					<Table.Tr>
						<Table.Th style={{ width: 50 }}></Table.Th>
						<Table.Th>{translate('nikki.vendingMachine.slideshow.media.fields.preview')}</Table.Th>
						<Table.Th>{translate('nikki.vendingMachine.slideshow.media.fields.code')}</Table.Th>
						<Table.Th>{translate('nikki.vendingMachine.slideshow.media.fields.name')}</Table.Th>
						<Table.Th>{translate('nikki.vendingMachine.slideshow.media.fields.type')}</Table.Th>
						<Table.Th>{translate('nikki.vendingMachine.slideshow.media.fields.duration')}</Table.Th>
						<Table.Th style={{ width: 80 }}>{translate('nikki.general.actions.title')}</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{[...media]
						.sort((a, b) => a.order - b.order)
						.map((item, index) => (
							<Table.Tr key={item.id}>
								<Table.Td>
									<Text size='xs' c='dimmed'>
										{item.order}
									</Text>
								</Table.Td>
								<Table.Td>
									<MediaPreview media={item} size='sm' />
								</Table.Td>
								<Table.Td>
									<Text size='sm' fw={500}>{item.code}</Text>
								</Table.Td>
								<Table.Td>
									<Text size='sm'>{item.name}</Text>
								</Table.Td>
								<Table.Td>
									<Badge
										color={item.type === 'image' ? 'blue' : 'red'}
										size='sm'
									>
										{item.type === 'image'
											? translate('nikki.vendingMachine.slideshow.media.type.image')
											: translate('nikki.vendingMachine.slideshow.media.type.video')}
									</Badge>
								</Table.Td>
								<Table.Td>
									<Text size='sm'>{formatDuration(item.duration)}</Text>
								</Table.Td>
								<Table.Td>
									<Tooltip label={translate('nikki.general.actions.delete')}>
										<ActionIcon
											variant='subtle'
											color='red'
											size='sm'
											onClick={() => onRemoveMedia(item.id)}
										>
											<IconTrash size={16} />
										</ActionIcon>
									</Tooltip>
								</Table.Td>
							</Table.Tr>
						))}
				</Table.Tbody>
			</Table>
		</Stack>
	);
};
