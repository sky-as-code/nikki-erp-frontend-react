import { Badge, Divider, Drawer, Group, Stack, Text, Title } from '@mantine/core';
import { IconMapPin, IconDeviceDesktop } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Kiosk, KioskMode, KioskStatus } from '../../types';


export interface KioskDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	kiosk: Kiosk | undefined;
	isLoading?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const KioskDetailDrawer: React.FC<KioskDetailDrawerProps> = ({
	opened,
	onClose,
	kiosk,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();

	if (isLoading || !kiosk) {
		return (
			<Drawer
				opened={opened}
				onClose={onClose}
				position='right'
				size='md'
				title={<Title order={4}>{translate('nikki.vendingMachine.kiosk.detail.title')}</Title>}
			>
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</Drawer>
		);
	}

	const getStatusBadge = (status: KioskStatus) => {
		const statusMap = {
			[KioskStatus.ACTIVATED]: { color: 'green', label: translate('nikki.vendingMachine.kiosk.status.activated') },
			[KioskStatus.DISABLED]: { color: 'gray', label: translate('nikki.vendingMachine.kiosk.status.disabled') },
			[KioskStatus.DELETED]: { color: 'red', label: translate('nikki.vendingMachine.kiosk.status.deleted') },
		};
		const statusInfo = statusMap[status];
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	const getModeBadge = (mode: KioskMode) => {
		const modeMap = {
			[KioskMode.PENDING]: { color: 'yellow', label: translate('nikki.vendingMachine.kiosk.mode.pending') },
			[KioskMode.SELLING]: { color: 'blue', label: translate('nikki.vendingMachine.kiosk.mode.selling') },
			[KioskMode.ADSONLY]: { color: 'purple', label: translate('nikki.vendingMachine.kiosk.mode.adsOnly') },
		};
		const modeInfo = modeMap[mode];
		return <Badge color={modeInfo.color}>{modeInfo.label}</Badge>;
	};

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position='right'
			size='md'
			title={
				<Group gap='xs'>
					<IconDeviceDesktop size={20} />
					<Title order={4}>{kiosk.name}</Title>
				</Group>
			}
			overlayProps={{ opacity: 0.5, blur: 4 }}
		>
			<Stack gap='md'>
				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{kiosk.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.name')}
					</Text>
					<Text size='sm'>{kiosk.name}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.address')}
					</Text>
					<Group gap='xs'>
						<IconMapPin size={16} />
						<Text size='sm'>{kiosk.address}</Text>
					</Group>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.coordinates')}
					</Text>
					<Text size='sm'>
						{kiosk.coordinates.latitude.toFixed(6)}, {kiosk.coordinates.longitude.toFixed(6)}
					</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.isActive')}
					</Text>
					<Badge color={kiosk.isActive ? 'green' : 'red'}>
						{kiosk.isActive
							? translate('nikki.general.status.active')
							: translate('nikki.general.status.inactive')}
					</Badge>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.status')}
					</Text>
					{getStatusBadge(kiosk.status)}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.mode')}
					</Text>
					{getModeBadge(kiosk.mode)}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.createdAt')}
					</Text>
					<Text size='sm'>{new Date(kiosk.createdAt).toLocaleString()}</Text>
				</div>

				{kiosk.deletedAt && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.kiosk.fields.deletedAt')}
							</Text>
							<Text size='sm'>{new Date(kiosk.deletedAt).toLocaleString()}</Text>
						</div>
					</>
				)}
			</Stack>
		</Drawer>
	);
};

