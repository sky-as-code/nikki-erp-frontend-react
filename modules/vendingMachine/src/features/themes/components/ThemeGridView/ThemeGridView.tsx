import { ActionIcon, Badge, Box, Card, Group, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash, IconPalette } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Theme } from '../../types';


export interface ThemeGridViewProps {
	themes: Theme[];
	isLoading?: boolean;
	onViewDetail: (themeId: string) => void;
	onEdit?: (themeId: string) => void;
	onDelete?: (themeId: string) => void;
}

export const ThemeGridView: React.FC<ThemeGridViewProps> = ({
	themes,
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

	if (themes.length === 0) {
		return <Text c='dimmed'>{translate('nikki.vendingMachine.themes.messages.no_themes')}</Text>;
	}

	return (
		<SimpleGrid
			cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
			spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
		>
			{themes.map((theme) => (
				<Card
					key={theme.id}
					shadow='sm'
					padding='lg'
					radius='md'
					withBorder
					style={{
						cursor: 'pointer',
					}}
					onClick={() => onViewDetail(theme.id)}
				>
					<Stack gap='sm'>
						<Group justify='space-between' align='flex-start'>
							<Group gap='xs'>
								<IconPalette size={20} />
								<Stack gap={0}>
									<Text fw={600} size='sm'>{theme.code}</Text>
									<Text size='xs' c='dimmed'>{theme.name}</Text>
								</Stack>
							</Group>
							<Group gap='xs' onClick={(e) => e.stopPropagation()}>
								{onEdit && (
									<Tooltip label={translate('nikki.general.actions.edit')}>
										<ActionIcon variant='subtle' color='gray' size='sm' onClick={() => onEdit(theme.id)}>
											<IconEdit size={14} />
										</ActionIcon>
									</Tooltip>
								)}
								{onDelete && (
									<Tooltip label={translate('nikki.general.actions.delete')}>
										<ActionIcon variant='subtle' color='red' size='sm' onClick={() => onDelete(theme.id)}>
											<IconTrash size={14} />
										</ActionIcon>
									</Tooltip>
								)}
							</Group>
						</Group>

						{theme.description && (
							<Text size='xs' c='dimmed' lineClamp={3}>
								{theme.description}
							</Text>
						)}

						<Group gap='xs' wrap='nowrap'>
							{getStatusBadge(theme.status)}
							<Group gap={4}>
								<Box
									style={{
										width: 20,
										height: 20,
										borderRadius: 4,
										backgroundColor: theme.primaryColor,
										border: '1px solid #ddd',
									}}
								/>
							</Group>
						</Group>

						<Text size='xs' c='dimmed'>
							{translate('nikki.vendingMachine.themes.fields.createdAt')}: {new Date(theme.createdAt).toLocaleDateString()}
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};
