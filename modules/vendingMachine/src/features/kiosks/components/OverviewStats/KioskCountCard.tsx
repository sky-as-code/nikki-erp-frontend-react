import { IconDeviceDesktop, IconDeviceDesktopOff } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';

import { GroupedStatCard } from '@/components/GroupedStatCard';


interface KioskCountCardProps {
	totalKiosks: number;
	activeKiosks: number;
	inactiveKiosks: number;
	translate: TFunction;
}

export function KioskCountCard({
	totalKiosks,
	activeKiosks,
	inactiveKiosks,
	translate,
}: KioskCountCardProps): React.ReactElement {

	const items = [
		{
			label: translate('nikki.vendingMachine.overview.total_kiosks'),
			value: totalKiosks,
			icon: <IconDeviceDesktop size={16} />,
			color: 'blue',
			link: '../kiosks',
		},
		{
			label: translate('nikki.vendingMachine.overview.active_kiosks'),
			value: activeKiosks,
			icon: <IconDeviceDesktop size={16} />,
			color: 'green',
			link: '../kiosks?status=active',
		},
		{
			label: translate('nikki.vendingMachine.overview.inactive_kiosks'),
			value: inactiveKiosks,
			icon: <IconDeviceDesktopOff size={16} />,
			color: 'red',
			link: '../kiosks?status=inactive',
		},
	];

	return (
		<GroupedStatCard
			title={translate('nikki.vendingMachine.overview.kiosk_count')}
			icon={<IconDeviceDesktop size={24} />}
			iconColor='blue'
			link='../kiosks'
			items={items}
		/>
	);
}
