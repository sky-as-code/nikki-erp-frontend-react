import { SimpleGrid } from '@mantine/core';
import {
	IconBolt,
	IconDeviceDesktop,
	IconDeviceDesktopOff,
	IconDroplet,
	IconTemperature,
} from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';

import { StatCard } from '../StatCard';


interface OverviewStatsProps {
	totalKiosks: number;
	activeKiosks: number;
	inactiveKiosks: number;
	avgTemperature: string;
	avgHumidity: string;
	totalPowerConsumption: string;
	translate: TFunction;
	cols?: { base?: number; xs?: number; md?: number };
	padding?: string | number;
	width?: { base?: string; md?: string };
}

export function OverviewStats({
	totalKiosks,
	activeKiosks,
	inactiveKiosks,
	avgTemperature,
	avgHumidity,
	totalPowerConsumption,
	translate,
	cols = { base: 1, xs: 2, md: 3 },
	padding = 'md',
	width,
}: OverviewStatsProps): React.ReactElement {
	return (
		<SimpleGrid cols={cols} p={padding} w={width}>
			<StatCard
				title={translate('nikki.vendingMachine.overview.total_kiosks')}
				value={totalKiosks}
				icon={<IconDeviceDesktop size={32} />}
				color='blue'
				link='../kiosks'
			/>
			<StatCard
				title={translate('nikki.vendingMachine.overview.active_kiosks')}
				value={activeKiosks}
				icon={<IconDeviceDesktop size={32} />}
				color='green'
				link='../kiosks?status=active'
			/>
			<StatCard
				title={translate('nikki.vendingMachine.overview.inactive_kiosks')}
				value={inactiveKiosks}
				icon={<IconDeviceDesktopOff size={32} />}
				color='red'
				link='../kiosks?status=inactive'
			/>
			<StatCard
				title={translate('nikki.vendingMachine.overview.avg_temperature')}
				value={avgTemperature}
				suffix='°C'
				icon={<IconTemperature size={32} />}
				color='orange'
			/>
			<StatCard
				title={translate('nikki.vendingMachine.overview.avg_humidity')}
				value={avgHumidity}
				suffix='%'
				icon={<IconDroplet size={32} />}
				color='cyan'
			/>
			<StatCard
				title={translate('nikki.vendingMachine.overview.total_power')}
				value={totalPowerConsumption}
				suffix='kW'
				icon={<IconBolt size={32} />}
				color='yellow'
			/>
		</SimpleGrid>
	);
}
