import { ActionIcon, Badge, Card, Group, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash, IconDeviceDesktop } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { KioskDevice } from '../../types';


export interface KioskDeviceGridViewProps {
	kioskDevices: KioskDevice[];
	isLoading?: boolean;
	onViewDetail: (kioskDeviceId: string) => void;
	onEdit?: (kioskDeviceId: string) => void;
	onDelete?: (kioskDeviceId: string) => void;
}

export const KioskDeviceGridView: React.FC<KioskDeviceGridViewProps> = ({
	kioskDevices,
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

	const getDeviceTypeBadge = (deviceType: string) => {
		const typeMap: Record<string, { color: string; label: string }> = {
			motor: { color: 'blue', label: translate('nikki.vendingMachine.device.deviceType.motor') },
			pos: { color: 'cyan', label: translate('nikki.vendingMachine.device.deviceType.pos') },
			screen: { color: 'purple', label: translate('nikki.vendingMachine.device.deviceType.screen') },
			cpu: { color: 'orange', label: translate('nikki.vendingMachine.device.deviceType.cpu') },
			router: { color: 'teal', label: translate('nikki.vendingMachine.device.deviceType.router') },
		};
		const typeInfo = typeMap[deviceType] || { color: 'gray', label: deviceType };
		return <Badge color={typeInfo.color} size='sm' variant='light'>{typeInfo.label}</Badge>;
	};

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (kioskDevices.length === 0) {
		return <Text c='dimmed'>{translate('nikki.vendingMachine.device.messages.no_devices')}</Text>;
	}

	return (
		<SimpleGrid
			cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
			spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
		>
			{kioskDevices.map((kioskDevice) => (
				<Card
					key={kioskDevice.id}
					shadow='sm'
					padding='lg'
					radius='md'
					withBorder
					style={{
						cursor: 'pointer',
					}}
					onClick={() => onViewDetail(kioskDevice.id)}
				>
					<Stack gap='sm'>
						<Group justify='space-between' align='flex-start'>
							<Group gap='xs'>
								<IconDeviceDesktop size={20} />
								<Stack gap={0}>
									<Text fw={600} size='sm'>{kioskDevice.code}</Text>
									<Text size='xs' c='dimmed'>{kioskDevice.name}</Text>
								</Stack>
							</Group>
							<Group gap='xs' onClick={(e) => e.stopPropagation()}>
								{onEdit && (
									<Tooltip label={translate('nikki.general.actions.edit')}>
										<ActionIcon variant='subtle' color='gray' size='sm' onClick={() => onEdit(kioskDevice.id)}>
											<IconEdit size={14} />
										</ActionIcon>
									</Tooltip>
								)}
								{onDelete && (
									<Tooltip label={translate('nikki.general.actions.delete')}>
										<ActionIcon variant='subtle' color='red' size='sm' onClick={() => onDelete(kioskDevice.id)}>
											<IconTrash size={14} />
										</ActionIcon>
									</Tooltip>
								)}
							</Group>
						</Group>

						{kioskDevice.description && (
							<Text size='xs' c='dimmed' lineClamp={3}>
								{kioskDevice.description}
							</Text>
						)}

						<Group gap='xs' wrap='nowrap'>
							{getStatusBadge(kioskDevice.status)}
							{getDeviceTypeBadge(kioskDevice.deviceType)}
						</Group>

						{kioskDevice.specifications && kioskDevice.specifications.length > 0 && (
							<Text size='xs' c='dimmed'>
								{kioskDevice.specifications.length} {translate('nikki.vendingMachine.device.fields.specifications')}
							</Text>
						)}

						<Text size='xs' c='dimmed'>
							{translate('nikki.vendingMachine.device.fields.createdAt')}: {new Date(kioskDevice.createdAt).toLocaleDateString()}
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};
