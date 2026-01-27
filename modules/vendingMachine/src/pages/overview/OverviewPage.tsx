import {
	Box,
	Grid,
	Center,
} from '@mantine/core';
import {
	IconBolt,
	IconDeviceDesktop,
	IconDeviceDesktopOff,
	IconDroplet,
	IconTemperature,
} from '@tabler/icons-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { StatCard } from './components';
import { KioskHitMap } from '../../features/kiosks/components/KioskHitMap';
import { useKioskList } from '../../features/kiosks/hooks';
import { KioskStatus, type Kiosk } from '../../features/kiosks/types';


// eslint-disable-next-line max-lines-per-function
function OverviewPageContent(): React.ReactNode {
	const { t: translate } = useTranslation();
	const { kiosks = [] } = useKioskList();

	// Calculate statistics from kiosk data
	const totalKiosks = kiosks.length;
	const activeKiosks = kiosks.filter((k: Kiosk) => k.status === KioskStatus.ACTIVATED && k.isActive).length;
	const inactiveKiosks = kiosks.filter((k: Kiosk) => !(k.status === KioskStatus.ACTIVATED && k.isActive)).length;

	const activeKiosksWithData = kiosks.filter((k: Kiosk) =>
		k.status === KioskStatus.ACTIVATED &&
		k.isActive &&
		k.temperature !== undefined &&
		k.temperature > 0,
	);
	const avgTemperature = activeKiosksWithData.length > 0
		? (activeKiosksWithData.reduce((sum: number, k: Kiosk) => sum + (k.temperature || 0), 0) /
			activeKiosksWithData.length).toFixed(1)
		: '0';
	const avgHumidity = activeKiosksWithData.length > 0
		? (activeKiosksWithData.reduce((sum: number, k: Kiosk) => sum + (k.humidity || 0), 0) /
			activeKiosksWithData.length).toFixed(1)
		: '0';
	const totalPowerConsumption = kiosks.reduce(
		(sum: number, k: Kiosk) => sum + (k.powerConsumption || 0),
		0,
	).toFixed(1);

	return (
		<Box>
			<Box pos='relative' h='calc(100vh - 80px)' mih={'500px'} w='100%' pt={10}>
				<Box pos='absolute' bg='var(--nikki-color-white)' p={4} bdrs={'sm'}
					top={10} left={0} right={0} bottom={0} z-index={0}
				>
					<KioskHitMap />
				</Box>

				<Grid w='50%' p={'md'}>
					<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
						<StatCard
							title={translate('nikki.vendingMachine.overview.total_kiosks') || 'Tổng số Kiosk'}
							value={totalKiosks}
							icon={<IconDeviceDesktop size={32} />}
							color='blue'
							link='../kiosks'
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
						<StatCard
							title={translate('nikki.vendingMachine.overview.active_kiosks') || 'Kiosk đang hoạt động'}
							value={activeKiosks}
							icon={<IconDeviceDesktop size={32} />}
							color='green'
							link='../kiosks?status=active'
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
						<StatCard
							title={translate('nikki.vendingMachine.overview.inactive_kiosks') || 'Kiosk không hoạt động'}
							value={inactiveKiosks}
							icon={<IconDeviceDesktopOff size={32} />}
							color='red'
							link='../kiosks?status=inactive'
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
						<StatCard
							title={translate('nikki.vendingMachine.overview.avg_temperature') || 'Nhiệt độ trung bình'}
							value={avgTemperature}
							suffix='°C'
							icon={<IconTemperature size={32} />}
							color='orange'
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
						<StatCard
							title={translate('nikki.vendingMachine.overview.avg_humidity') || 'Độ ẩm trung bình'}
							value={avgHumidity}
							suffix='%'
							icon={<IconDroplet size={32} />}
							color='cyan'
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
						<StatCard
							title={translate('nikki.vendingMachine.overview.total_power') || 'Tổng tiêu thụ điện'}
							value={totalPowerConsumption}
							suffix='kW'
							icon={<IconBolt size={32} />}
							color='yellow'
						/>
					</Grid.Col>
				</Grid>
			</Box>
			<Center mt={'md'} h={500} bg='white' c='dimmed'>
				Padding dock
			</Center>
		</Box>
	);
}

export const OverviewPage: React.FC = () => {
	const { t: translate } = useTranslation();
	useEffect(() => {
		document.title = translate('nikki.vendingMachine.overview.title', { defaultValue: 'Tổng quan - Máy bán hàng tự động' });
	}, [translate]);
	return <OverviewPageContent />;
};

