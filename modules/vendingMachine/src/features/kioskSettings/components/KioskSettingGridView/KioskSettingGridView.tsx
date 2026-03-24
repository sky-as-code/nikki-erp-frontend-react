import { ActionIcon, Badge, Card, Group, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconSettings2, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { KioskSetting } from '../../types';

export interface KioskSettingGridViewProps {
	settings: KioskSetting[];
	isLoading?: boolean;
	onViewDetail: (settingId: string) => void;
	onEdit?: (settingId: string) => void;
	onDelete?: (settingId: string) => void;
}

export const KioskSettingGridView: React.FC<KioskSettingGridViewProps> = ({
	settings,
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
		const info = statusMap[status];
		return <Badge color={info.color} size='sm'>{info.label}</Badge>;
	};

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (settings.length === 0) {
		return <Text c='dimmed'>{translate('nikki.vendingMachine.kioskSettings.messages.no_settings')}</Text>;
	}

	return (
		<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}>
			{settings.map((setting) => (
				<Card
					key={setting.id}
					shadow='sm'
					padding='lg'
					radius='md'
					withBorder
					style={{ cursor: 'pointer' }}
					onClick={() => onViewDetail(setting.id)}
				>
					<Stack gap='sm'>
						<Group justify='space-between' align='flex-start'>
							<Group gap='xs'>
								<IconSettings2 size={20} />
								<Stack gap={0}>
									<Text fw={600} size='sm'>{setting.code}</Text>
									<Text size='xs' c='dimmed'>{setting.name}</Text>
								</Stack>
							</Group>
							<Group gap='xs' onClick={(e) => e.stopPropagation()}>
								{onEdit && (
									<Tooltip label={translate('nikki.general.actions.edit')}>
										<ActionIcon variant='subtle' color='gray' size='sm' onClick={() => onEdit(setting.id)}>
											<IconEdit size={14} />
										</ActionIcon>
									</Tooltip>
								)}
								{onDelete && (
									<Tooltip label={translate('nikki.general.actions.delete')}>
										<ActionIcon variant='subtle' color='red' size='sm' onClick={() => onDelete(setting.id)}>
											<IconTrash size={14} />
										</ActionIcon>
									</Tooltip>
								)}
							</Group>
						</Group>

						{setting.description && (
							<Text size='xs' c='dimmed' lineClamp={3}>{setting.description}</Text>
						)}

						{setting.brand && (
							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.kioskSettings.fields.brand')}: {setting.brand}
							</Text>
						)}

						{setting.kiosks && setting.kiosks.length > 0 && (
							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.kioskSettings.fields.kiosks')}: {setting.kiosks.length}
							</Text>
						)}
						{setting.theme && (
							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.kioskSettings.fields.theme')}: {setting.theme.name}
							</Text>
						)}
						{setting.game && (
							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.kioskSettings.fields.game')}: {setting.game.name}
							</Text>
						)}

						<Group gap='xs' wrap='nowrap'>
							{getStatusBadge(setting.status)}
						</Group>

						<Text size='xs' c='dimmed'>
							{translate('nikki.vendingMachine.kioskSettings.fields.createdAt')}: {new Date(setting.createdAt).toLocaleDateString()}
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};
