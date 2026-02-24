import { ActionIcon, Badge, Card, Group, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash, IconPhoto } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Ad } from '../../types';


export interface AdGridViewProps {
	ads: Ad[];
	isLoading?: boolean;
	onViewDetail: (adId: string) => void;
	onEdit?: (adId: string) => void;
	onDelete?: (adId: string) => void;
}

export const AdGridView: React.FC<AdGridViewProps> = ({
	ads,
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
			expired: { color: 'red', label: translate('nikki.vendingMachine.ads.status.expired') },
		};
		const statusInfo = statusMap[status];
		return <Badge color={statusInfo.color} size='sm'>{statusInfo.label}</Badge>;
	};

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (ads.length === 0) {
		return <Text c='dimmed'>{translate('nikki.vendingMachine.ads.messages.no_ads')}</Text>;
	}

	return (
		<SimpleGrid
			cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
			spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
		>
			{ads.map((ad) => (
				<Card
					key={ad.id}
					shadow='sm'
					padding='lg'
					radius='md'
					withBorder
					style={{
						cursor: 'pointer',
					}}
					onClick={() => onViewDetail(ad.id)}
				>
					<Stack gap='sm'>
						<Group justify='space-between' align='flex-start'>
							<Group gap='xs'>
								<IconPhoto size={20} />
								<Stack gap={0}>
									<Text fw={600} size='sm'>{ad.code}</Text>
									<Text size='xs' c='dimmed'>{ad.name}</Text>
								</Stack>
							</Group>
							<Group gap='xs' onClick={(e) => e.stopPropagation()}>
								{onEdit && (
									<Tooltip label={translate('nikki.general.actions.edit')}>
										<ActionIcon variant='subtle' color='gray' size='sm' onClick={() => onEdit(ad.id)}>
											<IconEdit size={14} />
										</ActionIcon>
									</Tooltip>
								)}
								{onDelete && (
									<Tooltip label={translate('nikki.general.actions.delete')}>
										<ActionIcon variant='subtle' color='red' size='sm' onClick={() => onDelete(ad.id)}>
											<IconTrash size={14} />
										</ActionIcon>
									</Tooltip>
								)}
							</Group>
						</Group>

						{ad.description && (
							<Text size='xs' c='dimmed' lineClamp={3}>
								{ad.description}
							</Text>
						)}

						<Group gap='xs' wrap='nowrap'>
							{getStatusBadge(ad.status)}
						</Group>

						<Stack gap={4}>
							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.ads.fields.startDate')}: {new Date(ad.startDate).toLocaleDateString()}
							</Text>
							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.ads.fields.endDate')}: {new Date(ad.endDate).toLocaleDateString()}
							</Text>
						</Stack>

						<Text size='xs' c='dimmed'>
							{translate('nikki.vendingMachine.ads.fields.createdAt')}: {new Date(ad.createdAt).toLocaleDateString()}
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};
