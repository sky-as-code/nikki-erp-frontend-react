import { ActionIcon, Badge, Group, Table, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash, IconMapPin } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Kiosk, KioskMode, KioskStatus } from '../../types';


export interface KioskListViewProps {
	kiosks: Kiosk[];
	isLoading?: boolean;
	onViewDetail: (kioskId: string) => void;
	onEdit?: (kioskId: string) => void;
	onDelete?: (kioskId: string) => void;
}

// eslint-disable-next-line max-lines-per-function
export const KioskListView: React.FC<KioskListViewProps> = ({
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
		<Table>
			<Table.Thead>
				<Table.Tr>
					<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.code')}</Table.Th>
					<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.name')}</Table.Th>
					<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.address')}</Table.Th>
					<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.status')}</Table.Th>
					<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.mode')}</Table.Th>
					<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.isActive')}</Table.Th>
					<Table.Th>{translate('nikki.general.actions.title')}</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{kiosks.map((kiosk) => (
					<Table.Tr key={kiosk.id} style={{ cursor: 'pointer' }} onClick={() => onViewDetail(kiosk.id)}>
						<Table.Td>
							<Text fw={500}>{kiosk.code}</Text>
						</Table.Td>
						<Table.Td>{kiosk.name}</Table.Td>
						<Table.Td>
							<Group gap='xs'>
								<IconMapPin size={14} />
								<Text size='sm' c='dimmed' lineClamp={1} style={{ maxWidth: 200 }}>
									{kiosk.address}
								</Text>
							</Group>
						</Table.Td>
						<Table.Td>{getStatusBadge(kiosk.status)}</Table.Td>
						<Table.Td>{getModeBadge(kiosk.mode)}</Table.Td>
						<Table.Td>
							<Badge color={kiosk.isActive ? 'green' : 'red'} size='sm'>
								{kiosk.isActive
									? translate('nikki.general.status.active')
									: translate('nikki.general.status.inactive')}
							</Badge>
						</Table.Td>
						<Table.Td>
							<Group gap='xs' justify='flex-end' onClick={(e) => e.stopPropagation()}>
								{onEdit && (
									<Tooltip label={translate('nikki.general.actions.edit')}>
										<ActionIcon variant='subtle' color='gray' onClick={() => onEdit(kiosk.id)}>
											<IconEdit size={16} />
										</ActionIcon>
									</Tooltip>
								)}
								{onDelete && (
									<Tooltip label={translate('nikki.general.actions.delete')}>
										<ActionIcon variant='subtle' color='red' onClick={() => onDelete(kiosk.id)}>
											<IconTrash size={16} />
										</ActionIcon>
									</Tooltip>
								)}
							</Group>
						</Table.Td>
					</Table.Tr>
				))}
			</Table.Tbody>
		</Table>
	);
};

