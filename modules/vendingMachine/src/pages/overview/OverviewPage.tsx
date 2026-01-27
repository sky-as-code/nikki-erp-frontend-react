import {
	Box,
	Center,
} from '@mantine/core';
import { useDocumentTitle } from '@nikkierp/ui/hooks';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { OverviewStats } from './components';
import { KioskHitMap } from '../../features/kiosks/components/KioskHitMap';
import { useKioskList } from '../../features/kiosks/hooks';
import { KioskStatus, type Kiosk } from '../../features/kiosks/types';


export function OverviewPage(): React.ReactNode {
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

	useDocumentTitle('nikki.vendingMachine.overview.title');

	return (
		<Box pt={'sm'}>
			{/* Desktop: Map as background */}
			<Box
				pos='relative' h='calc(100vh - 80px)' mih={'500px'} w='100%'
				display={{ base: 'none', md: 'block' }}
			>
				<Box
					pos='absolute' p={3} bdrs={'sm'}
					bg='var(--nikki-color-white)'
					top={0} left={0} right={0} bottom={0} z-index={0}
				>
					<KioskHitMap />
				</Box>
				<OverviewStats
					totalKiosks={totalKiosks}
					activeKiosks={activeKiosks}
					inactiveKiosks={inactiveKiosks}
					avgTemperature={avgTemperature}
					avgHumidity={avgHumidity}
					totalPowerConsumption={totalPowerConsumption}
					translate={translate}
					cols={{ base: 1, xs: 2, md: 3 }}
					width={{ base: '100%', md: '50%' }}
				/>
			</Box>

			{/* Mobile: Stats displayed below map */}
			<Box display={{ base: 'block', md: 'none' }} py='md' mb='md'>
				<OverviewStats
					totalKiosks={totalKiosks}
					activeKiosks={activeKiosks}
					inactiveKiosks={inactiveKiosks}
					avgTemperature={avgTemperature}
					avgHumidity={avgHumidity}
					totalPowerConsumption={totalPowerConsumption}
					translate={translate}
					padding={0}
					cols={{ base: 1, xs: 2 }}
				/>
			</Box>

			{/* Mobile: Map displayed as separate section */}
			<Box
				display={{ base: 'block', md: 'none' }}
				p={3} h='400px' w='100%'
				bdrs={'sm'} mb='md'
				bg='var(--nikki-color-white)'
			>
				<KioskHitMap />
			</Box>
			<Center mt={'md'} h={300} bg='white' c='dimmed' mb={'md'}>
				Padding dock
			</Center>
		</Box>
	);
}
