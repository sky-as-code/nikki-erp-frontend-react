import { ActionIcon, Badge, Card, Group, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash, IconMapPin, IconDeviceDesktop } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Kiosk, KioskMode, KioskStatus } from '../../types';


export interface KioskGridViewProps {
	kiosks: Kiosk[];
	isLoading?: boolean;
	onViewDetail: (kioskId: string) => void;
	onEdit?: (kioskId: string) => void;
	onDelete?: (kioskId: string) => void;
}

export const KioskGridView: React.FC<KioskGridViewProps> = ({
	kiosks,
	isLoading = false,
	onViewDetail,
	onEdit,
	onDelete,
}) => {
	const { t: translate } = useTranslation();

	const getStatusBadge = (status: KioskStatus) => {
		const statusMap = {
			[KioskStatus.ACTIVATED]: { color: 'green', label: translate('nikki.vendingMachine.kiosk.status.activated') },
			[KioskStatus.DISABLED]: { color: 'gray', label: translate('nikki.vendingMachine.kiosk.status.disabled') },
			[KioskStatus.DELETED]: { color: 'red', label: translate('nikki.vendingMachine.kiosk.status.deleted') },
		};
		const statusInfo = statusMap[status];
		return <Badge color={statusInfo.color} size='sm'>{statusInfo.label}</Badge>;
	};

	const getModeBadge = (mode: KioskMode) => {
		const modeMap = {
			[KioskMode.PENDING]: { color: 'yellow', label: translate('nikki.vendingMachine.kiosk.mode.pending') },
			[KioskMode.SELLING]: { color: 'blue', label: translate('nikki.vendingMachine.kiosk.mode.selling') },
			[KioskMode.ADSONLY]: { color: 'purple', label: translate('nikki.vendingMachine.kiosk.mode.adsOnly') },
		};
		const modeInfo = modeMap[mode];
		return <Badge color={modeInfo.color} size='sm' variant='light'>{modeInfo.label}</Badge>;
	};

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (kiosks.length === 0) {
		return <Text c='dimmed'>{translate('nikki.vendingMachine.kiosk.messages.no_kiosks')}</Text>;
	}

	return (
		<SimpleGrid
			cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
			spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
		>
			{kiosks.map((kiosk) => (
				<Card
					key={kiosk.id}
					shadow='sm'
					padding='lg'
					radius='md'
					withBorder
					style={{ cursor: 'pointer' }}
					onClick={() => onViewDetail(kiosk.id)}
				>
					<Stack gap='sm'>
						<Group justify='space-between' align='flex-start'>
							<Group gap='xs'>
								<IconDeviceDesktop size={20} />
								<Stack gap={0}>
									<Text fw={600} size='sm'>{kiosk.code}</Text>
									<Text size='xs' c='dimmed'>{kiosk.name}</Text>
								</Stack>
							</Group>
							<Group gap='xs' onClick={(e) => e.stopPropagation()}>
								{onEdit && (
									<Tooltip label={translate('nikki.general.actions.edit')}>
										<ActionIcon variant='subtle' color='gray' size='sm' onClick={() => onEdit(kiosk.id)}>
											<IconEdit size={14} />
										</ActionIcon>
									</Tooltip>
								)}
								{onDelete && (
									<Tooltip label={translate('nikki.general.actions.delete')}>
										<ActionIcon variant='subtle' color='red' size='sm' onClick={() => onDelete(kiosk.id)}>
											<IconTrash size={14} />
										</ActionIcon>
									</Tooltip>
								)}
							</Group>
						</Group>

						<Group gap='xs'>
							<IconMapPin size={14} />
							<Text size='xs' c='dimmed' lineClamp={2} style={{ flex: 1 }}>
								{kiosk.address}
							</Text>
						</Group>

						<Group gap='xs' wrap='nowrap'>
							{getStatusBadge(kiosk.status)}
							{getModeBadge(kiosk.mode)}
							<Badge color={kiosk.isActive ? 'green' : 'red'} size='sm'>
								{kiosk.isActive
									? translate('nikki.general.status.active')
									: translate('nikki.general.status.inactive')}
							</Badge>
						</Group>

						<Text size='xs' c='dimmed'>
							{translate('nikki.vendingMachine.kiosk.fields.createdAt')}: {new Date(kiosk.createdAt).toLocaleDateString()}
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};

