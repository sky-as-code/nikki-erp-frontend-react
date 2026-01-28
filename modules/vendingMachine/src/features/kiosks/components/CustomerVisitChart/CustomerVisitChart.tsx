import { Card, Title } from '@mantine/core';
import {
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
} from 'chart.js';
import { TFunction } from 'i18next';
import React from 'react';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { type CustomerUsage } from '../../../../features/kiosks/types';


ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
);

interface CustomerVisitChartProps {
	usageData: CustomerUsage[];
}


const getChartData = (usageData: CustomerUsage[], translate: TFunction) => {
	// Group by date and sum usage counts
	const groupedByDate: Record<string, number> = {};
	usageData.forEach((item) => {
		const date = item.date;
		groupedByDate[date] = (groupedByDate[date] || 0) + item.usageCount;
	});

	// Sort dates
	const sortedDates = Object.keys(groupedByDate).sort();
	const totalVisits = sortedDates.map((date) => groupedByDate[date]);

	return {
		labels: sortedDates.map((date) => {
			const d = new Date(date);
			return `${d.getDate()}/${d.getMonth() + 1}`;
		}),
		datasets: [
			{
				label: translate('nikki.vendingMachine.overview.customerVisit.visits'),
				data: totalVisits,
				borderColor: 'rgba(59, 130, 246, 1)',
				backgroundColor: 'rgba(59, 130, 246, 0.1)',
				tension: 0.4,
				fill: true,
			},
		],
	};
};

export function CustomerVisitChart({ usageData }: CustomerVisitChartProps): React.ReactElement {
	const { t: translate } = useTranslation();

	const data = getChartData(usageData, translate);

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		interaction: {
			mode: 'index' as const,
			intersect: false,
		},
		plugins: {
			legend: {
				position: 'top' as const,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: translate('nikki.vendingMachine.overview.customerVisit.count'),
				},
			},
			x: {
				title: {
					display: true,
					text: translate('nikki.vendingMachine.overview.customerVisit.date'),
				},
			},
		},
	};

	return (
		<Card shadow='sm' padding='sm' radius='md' withBorder h='100%'>
			<Title order={4} mb='xs' fz='sm'>
				{translate('nikki.vendingMachine.overview.customerVisit.title')}
			</Title>
			<div style={{ height: '350px', position: 'relative' }}>
				<Line data={data} options={options} />
			</div>
		</Card>
	);
}
