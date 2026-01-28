import { Box, Card, MantineStyleProps, Title } from '@mantine/core';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { MachineType, type Kiosk } from '../../../../features/kiosks/types';


ChartJS.register(ArcElement, Tooltip, Legend);

interface MachineTypeChartProps {
	kiosks: Kiosk[];
	h: MantineStyleProps['h'];
}

export function MachineTypeChart({ kiosks, h = '100%' }: MachineTypeChartProps): React.ReactElement {
	const { t: translate } = useTranslation();

	const dropProductCount = kiosks.filter((k) => k.machineType === MachineType.DROP_PRODUCT).length;
	const elevatorCount = kiosks.filter((k) => k.machineType === MachineType.ELEVATOR).length;

	const data = {
		labels: [
			translate('nikki.vendingMachine.overview.machineType.dropProduct'),
			translate('nikki.vendingMachine.overview.machineType.elevator'),
		],
		datasets: [
			{
				label: translate('nikki.vendingMachine.overview.machineType.distribution'),
				data: [dropProductCount, elevatorCount],
				backgroundColor: [
					'rgba(34, 197, 94, 0.8)', // green
					'rgba(59, 130, 246, 0.8)', // blue
				],
				borderColor: [
					'rgba(34, 197, 94, 1)',
					'rgba(59, 130, 246, 1)',
				],
				borderWidth: 1,
				spacing: 0,
				borderRadius: 1,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		cutout: '60%',
		plugins: {
			legend: {
				position: 'bottom' as const,
				labels: {
					boxWidth: 10,
					boxHeight: 10,
					usePointStyle: true,
					pointStyle: 'rect',
					pointRadius: 5,
					pointHoverRadius: 7,
				},
				align: 'center' as const,
			},
			tooltip: {
				callbacks: {
					label: (context: any) => {
						const label = context.label || '';
						const value = context.parsed || 0;
						const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
						const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
						return `${label}: ${value} (${percentage}%)`;
					},
				},
			},
		},
	};

	return (
		<Card shadow='sm' padding='sm' radius='md' withBorder h={h}>
			<Title order={4} mb='xs' fz='sm'>
				{translate('nikki.vendingMachine.overview.machineType.distribution')}
			</Title>
			<Box h={h} pos='relative'>
				<Doughnut data={data} options={options} />
			</Box>
		</Card>
	);
}
