/* eslint-disable max-lines-per-function */
import { ActionIcon, Badge, Card, Group, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { IconBox, IconEdit, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { KioskModel } from '../../types';


export interface KioskModelGridViewProps {
	models: KioskModel[];
	isLoading?: boolean;
	onPreviewView: (kioskModel: KioskModel) => void;
	onEdit?: (kioskModel: KioskModel) => void;
	onDelete?: (kioskModel: KioskModel) => void;
}

export const KioskModelGridView: React.FC<KioskModelGridViewProps> = ({
	models,
	isLoading = false,
	onPreviewView,
	onEdit,
	onDelete,
}) => {
	const { t: translate } = useTranslation();

	const getStatusBadge = (status: 'active' | 'inactive') => {
		const statusMap = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
		};
		const statusInfo = statusMap[status];
		return <Badge color={statusInfo.color} size='sm'>{statusInfo.label}</Badge>;
	};

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (models.length === 0) {
		return <Text c='dimmed'>{translate('nikki.vendingMachine.kioskModels.messages.no_models')}</Text>;
	}

	return (
		<SimpleGrid
			cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
			spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
		>
			{models.map((model) => (
				<Card
					key={model.id}
					shadow='sm'
					padding='lg'
					radius='md'
					withBorder
					style={{
						cursor: 'pointer',
					}}
					onClick={() => onPreviewView(model)}
				>
					<Stack gap='sm'>
						<Group justify='space-between' align='flex-start'>
							<Group gap='xs'>
								<IconBox size={20} />
								<Stack gap={0}>
									<Text fw={600} size='sm'>{model.code}</Text>
									<Text size='xs' c='dimmed'>{model.name}</Text>
								</Stack>
							</Group>
							<Group gap='xs' onClick={(e) => e.stopPropagation()}>
								{onEdit && (
									<Tooltip label={translate('nikki.general.actions.edit')}>
										<ActionIcon variant='subtle' color='gray' size='sm' onClick={() => onEdit(model)}>
											<IconEdit size={14} />
										</ActionIcon>
									</Tooltip>
								)}
								{onDelete && (
									<Tooltip label={translate('nikki.general.actions.delete')}>
										<ActionIcon variant='subtle' color='red' size='sm' onClick={() => onDelete(model)}>
											<IconTrash size={14} />
										</ActionIcon>
									</Tooltip>
								)}
							</Group>
						</Group>

						{model.description && (
							<Text size='xs' c='dimmed' lineClamp={3}>
								{model.description}
							</Text>
						)}

						<Group gap='xs' wrap='nowrap'>
							{getStatusBadge(model.status)}
						</Group>

						<Text size='xs' c='dimmed'>
							{translate('nikki.vendingMachine.kioskModels.fields.createdAt')}: {new Date(model.createdAt).toLocaleDateString()}
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};
