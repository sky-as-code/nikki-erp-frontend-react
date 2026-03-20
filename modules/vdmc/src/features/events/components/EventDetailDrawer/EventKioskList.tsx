/* eslint-disable max-lines-per-function */
import { ActionIcon, Badge, Button, Group, Stack, Table, Text } from '@mantine/core';
import { IconDeviceDesktop, IconMapPin, IconPlus, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Kiosk, KioskMode, KioskStatus } from '../../../kiosks/types';


export interface EventKioskListProps {
	kiosks: Kiosk[];
	onAddKiosks?: () => void;
	onRemoveKiosk?: (kioskId: string) => void;
}

export const EventKioskList: React.FC<EventKioskListProps> = ({ kiosks, onAddKiosks, onRemoveKiosk }) => {
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
			[KioskMode.SLIDESHOWONLY]: { color: 'purple', label: translate('nikki.vendingMachine.kiosk.mode.slideshowOnly') },
		};
		const modeInfo = modeMap[mode];
		return <Badge color={modeInfo.color} size='sm' variant='light'>{modeInfo.label}</Badge>;
	};

	return (
		<Stack gap='md'>
			{onAddKiosks && (
				<Group justify='flex-end'>
					<Button
						size='xs'
						leftSection={<IconPlus size={14} />}
						onClick={onAddKiosks}
					>
						{translate('nikki.vendingMachine.events.selectKiosks.addKiosks')}
					</Button>
				</Group>
			)}
			{!kiosks || kiosks.length === 0 ? (
				<Text size='sm' c='dimmed' ta='center' py='md'>
					{translate('nikki.vendingMachine.events.messages.no_kiosks')}
				</Text>
			) : (
				<Table striped highlightOnHover>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.code')}</Table.Th>
							<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.name')}</Table.Th>
							<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.address')}</Table.Th>
							<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.status')}</Table.Th>
							<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.mode')}</Table.Th>
							{onRemoveKiosk && <Table.Th style={{ width: 50 }}></Table.Th>}
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{kiosks.map((kiosk) => (
							<Table.Tr key={kiosk.id}>
								<Table.Td>
									<Text size='sm' fw={500}>{kiosk.code}</Text>
								</Table.Td>
								<Table.Td>
									<Group gap='xs'>
										<IconDeviceDesktop size={16} />
										<Text size='sm'>{kiosk.name}</Text>
									</Group>
								</Table.Td>
								<Table.Td>
									<Group gap='xs'>
										<IconMapPin size={14} />
										<Text size='sm' lineClamp={1} style={{ maxWidth: 200 }}>
											{kiosk.address}
										</Text>
									</Group>
								</Table.Td>
								<Table.Td>{getStatusBadge(kiosk.status)}</Table.Td>
								<Table.Td>{getModeBadge(kiosk.mode)}</Table.Td>
								{onRemoveKiosk && (
									<Table.Td>
										<ActionIcon
											variant='subtle'
											color='red'
											onClick={() => onRemoveKiosk(kiosk.id)}
										>
											<IconTrash size={16} />
										</ActionIcon>
									</Table.Td>
								)}
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			)}
		</Stack>
	);
};
