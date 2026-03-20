import { ActionIcon, Badge, Card, Group, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash, IconPhoto } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Slideshow } from '../../types';


export interface SlideshowGridViewProps {
	slideshows: Slideshow[];
	isLoading?: boolean;
	onViewDetail: (slideshowId: string) => void;
	onEdit?: (slideshowId: string) => void;
	onDelete?: (slideshowId: string) => void;
}

export const SlideshowGridView: React.FC<SlideshowGridViewProps> = ({
	slideshows,
	isLoading = false,
	onViewDetail,
	onEdit,
	onDelete,
}) => {
	const { t: translate } = useTranslation();

	const getStatusBadge = (status: 'active' | 'inactive' | 'expired') => {
		const statusMap = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
			expired: { color: 'red', label: translate('nikki.vendingMachine.slideshow.status.expired') },
		};
		const statusInfo = statusMap[status];
		return <Badge color={statusInfo.color} size='sm'>{statusInfo.label}</Badge>;
	};

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (slideshows.length === 0) {
		return <Text c='dimmed'>{translate('nikki.vendingMachine.slideshow.messages.no_ads')}</Text>;
	}

	return (
		<SimpleGrid
			cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
			spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
		>
			{slideshows.map((slideshow) => (
				<Card
					key={slideshow.id}
					shadow='sm'
					padding='lg'
					radius='md'
					withBorder
					style={{
						cursor: 'pointer',
					}}
					onClick={() => onViewDetail(slideshow.id)}
				>
					<Stack gap='sm'>
						<Group justify='space-between' align='flex-start'>
							<Group gap='xs'>
								<IconPhoto size={20} />
								<Stack gap={0}>
									<Text fw={600} size='sm'>{slideshow.code}</Text>
									<Text size='xs' c='dimmed'>{slideshow.name}</Text>
								</Stack>
							</Group>
							<Group gap='xs' onClick={(e) => e.stopPropagation()}>
								{onEdit && (
									<Tooltip label={translate('nikki.general.actions.edit')}>
										<ActionIcon variant='subtle' color='gray' size='sm' onClick={() => onEdit(slideshow.id)}>
											<IconEdit size={14} />
										</ActionIcon>
									</Tooltip>
								)}
								{onDelete && (
									<Tooltip label={translate('nikki.general.actions.delete')}>
										<ActionIcon variant='subtle' color='red' size='sm' onClick={() => onDelete(slideshow.id)}>
											<IconTrash size={14} />
										</ActionIcon>
									</Tooltip>
								)}
							</Group>
						</Group>

						{slideshow.description && (
							<Text size='xs' c='dimmed' lineClamp={3}>
								{slideshow.description}
							</Text>
						)}

						<Group gap='xs' wrap='nowrap'>
							{getStatusBadge(slideshow.status)}
						</Group>

						<Stack gap={4}>
							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.slideshow.fields.startDate')}: {new Date(slideshow.startDate).toLocaleDateString()}
							</Text>
							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.slideshow.fields.endDate')}: {new Date(slideshow.endDate).toLocaleDateString()}
							</Text>
						</Stack>

						<Text size='xs' c='dimmed'>
							{translate('nikki.vendingMachine.slideshow.fields.createdAt')}: {new Date(slideshow.createdAt).toLocaleDateString()}
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};
