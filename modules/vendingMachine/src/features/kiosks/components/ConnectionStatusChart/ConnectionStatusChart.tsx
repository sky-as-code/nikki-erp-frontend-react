import { Box, Card, MantineStyleProps, Title } from '@mantine/core';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { TFunction } from 'i18next';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { ConnectionStatus, type Kiosk } from '@/features/kiosks/types';


ChartJS.register(ArcElement, Tooltip, Legend);


const getChartData = (kiosks: Kiosk[], translate: TFunction) => {
	const fastCount = kiosks.filter((k) => k.connectionStatus === ConnectionStatus.FAST).length;
	const slowCount = kiosks.filter((k) => k.connectionStatus === ConnectionStatus.SLOW).length;
	const disconnectedCount = kiosks.filter((k) => k.connectionStatus === ConnectionStatus.DISCONNECTED).length;

	return{
		labels: [
			translate('nikki.vendingMachine.overview.connection.fast'),
			translate('nikki.vendingMachine.overview.connection.slow'),
			translate('nikki.vendingMachine.overview.connection.disconnected'),
		],
		datasets: [
			{
				label: translate('nikki.vendingMachine.overview.connection.status'),
				data: [fastCount, slowCount, disconnectedCount],
				backgroundColor: [
					'rgba(34, 197, 94, 0.8)', // green
					'rgba(251, 191, 36, 0.8)', // yellow
					'rgba(239, 68, 68, 0.8)', // red
				],
				borderColor: [
					'rgba(34, 197, 94, 1)',
					'rgba(251, 191, 36, 1)',
					'rgba(239, 68, 68, 1)',
				],
				borderWidth: 1,
				spacing: 0,
				borderRadius: 1,
			},
		],
	};
};

interface ConnectionStatusChartProps {
	kiosks: Kiosk[];
	h: MantineStyleProps['h'];
}

export function ConnectionStatusChart({ kiosks, h = '100%' }: ConnectionStatusChartProps): React.ReactElement {
	const { t: translate } = useTranslation();
	const data = getChartData(kiosks, translate);

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
				{translate('nikki.vendingMachine.overview.connection.status')}
			</Title>
			<Box h={h} pos='relative'>
				<Doughnut data={data} options={options} />
			</Box>
		</Card>
	);
}
