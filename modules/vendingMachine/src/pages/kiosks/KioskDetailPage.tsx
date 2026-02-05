/* eslint-disable max-lines-per-function */
import { Badge, Divider, Group, Stack, Text } from '@mantine/core';
import { IconDeviceDesktop, IconMapPin } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { DetailActionBar } from '@/components/ActionBar';
import { PageContainer } from '@/components/PageContainer';
import { useKioskDetail } from '@/features/kiosks';
import { KioskMode, KioskStatus } from '@/features/kiosks/types';


export const KioskDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const { kiosk, isLoading } = useKioskDetail(id);

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

	const breadcrumbs = [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kiosk.title'), href: '../kiosks' },
		{ title: kiosk?.name || translate('nikki.vendingMachine.kiosk.detail.title'), href: '#' },
	];

	if (isLoading || !kiosk) {
		return (
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={<div />}
			>
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</PageContainer>
		);
	}

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			actionBar={<DetailActionBar
				onSave={() => {}}
				onGoBack={() => {}}
				onDelete={() => {}}
			/>}
		>
			<Stack gap='md'>
				<Group gap='xs' mb='md'>
					<IconDeviceDesktop size={20} />
					<Text fw={600} size='lg'>{kiosk.name}</Text>
				</Group>

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
		</PageContainer>
	);
};
