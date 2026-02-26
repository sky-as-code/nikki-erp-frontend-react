import { Box, Card, MantineStyleProps, Title } from '@mantine/core';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { KioskMode, type Kiosk } from '../../../../features/kiosks/types';


ChartJS.register(ArcElement, Tooltip, Legend);

interface OperationStatusChartProps {
	kiosks: Kiosk[];
	h: MantineStyleProps['h'];
}

export function OperationStatusChart({ kiosks, h = '100%' }: OperationStatusChartProps): React.ReactElement {
	const { t: translate } = useTranslation();

	const sellingCount = kiosks.filter((k) => k.mode === KioskMode.SELLING).length;
	const adsOnlyCount = kiosks.filter((k) => k.mode === KioskMode.ADSONLY).length;
	const pendingCount = kiosks.filter((k) => k.mode === KioskMode.PENDING).length;

	const data = {
		labels: [
			translate('nikki.vendingMachine.overview.operation.selling'),
			translate('nikki.vendingMachine.overview.operation.adsOnly'),
			translate('nikki.vendingMachine.overview.operation.pending'),
		],
		datasets: [
			{
				label: translate('nikki.vendingMachine.overview.operation.status'),
				data: [sellingCount, adsOnlyCount, pendingCount],
				backgroundColor: [
					'rgba(59, 130, 246, 0.8)', // blue
					'rgba(168, 85, 247, 0.8)', // purple
					'rgba(156, 163, 175, 0.8)', // gray
				],
				borderColor: [
					'rgba(59, 130, 246, 1)',
					'rgba(168, 85, 247, 1)',
					'rgba(156, 163, 175, 1)',
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
					pointStyle: 'circle',
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
				{translate('nikki.vendingMachine.overview.operation.status')}
			</Title>
			<Box h={h} pos='relative'>
				<Doughnut data={data} options={options} />
			</Box>
		</Card>
	);
}
