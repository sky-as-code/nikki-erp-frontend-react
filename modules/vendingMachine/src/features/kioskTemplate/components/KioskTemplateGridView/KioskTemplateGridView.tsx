/* eslint-disable max-lines-per-function */
import { ActionIcon, Badge, Card, Group, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash, IconTemplate } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { KioskTemplate } from '../../types';


export interface KioskTemplateGridViewProps {
	templates: KioskTemplate[];
	isLoading?: boolean;
	onViewDetail: (templateId: string) => void;
	onEdit?: (templateId: string) => void;
	onDelete?: (templateId: string) => void;
}

export const KioskTemplateGridView: React.FC<KioskTemplateGridViewProps> = ({
	templates,
	isLoading = false,
	onViewDetail,
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

	if (templates.length === 0) {
		return <Text c='dimmed'>{translate('nikki.vendingMachine.kioskTemplate.messages.no_templates')}</Text>;
	}

	return (
		<SimpleGrid
			cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
			spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
		>
			{templates.map((template) => (
				<Card
					key={template.id}
					shadow='sm'
					padding='lg'
					radius='md'
					withBorder
					style={{
						cursor: 'pointer',
					}}
					onClick={() => onViewDetail(template.id)}
				>
					<Stack gap='sm'>
						<Group justify='space-between' align='flex-start'>
							<Group gap='xs'>
								<IconTemplate size={20} />
								<Stack gap={0}>
									<Text fw={600} size='sm'>{template.code}</Text>
									<Text size='xs' c='dimmed'>{template.name}</Text>
								</Stack>
							</Group>
							<Group gap='xs' onClick={(e) => e.stopPropagation()}>
								{onEdit && (
									<Tooltip label={translate('nikki.general.actions.edit')}>
										<ActionIcon variant='subtle' color='gray' size='sm' onClick={() => onEdit(template.id)}>
											<IconEdit size={14} />
										</ActionIcon>
									</Tooltip>
								)}
								{onDelete && (
									<Tooltip label={translate('nikki.general.actions.delete')}>
										<ActionIcon variant='subtle' color='red' size='sm' onClick={() => onDelete(template.id)}>
											<IconTrash size={14} />
										</ActionIcon>
									</Tooltip>
								)}
							</Group>
						</Group>

						{template.description && (
							<Text size='xs' c='dimmed' lineClamp={3}>
								{template.description}
							</Text>
						)}

						<Group gap='xs' wrap='nowrap'>
							{getStatusBadge(template.status)}
						</Group>

						<Text size='xs' c='dimmed'>
							{translate('nikki.vendingMachine.kioskTemplate.fields.createdAt')}: {new Date(template.createdAt).toLocaleDateString()}
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};
