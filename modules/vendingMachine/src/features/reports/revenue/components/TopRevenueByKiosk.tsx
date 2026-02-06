/* eslint-disable max-lines-per-function */
import { Card, Group, Stack, Text, Title } from '@mantine/core';
import {
	CategoryScale,
	Chart as ChartJS,
	LinearScale,
	BarElement,
	Tooltip,
	Legend,
} from 'chart.js';
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface KioskRevenueData {
	kioskId: string;
	kioskName: string;
	revenue: number;
	orders: number;
}

interface TopRevenueByKioskProps {
	data: KioskRevenueData[];
	maxDisplay?: number;
}

export function TopRevenueByKiosk({ data, maxDisplay = 5 }: TopRevenueByKioskProps): React.ReactElement {
	// Sort by revenue descending and take top items
	const sortedData = useMemo(() => {
		const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
		const topItems = sorted.slice(0, maxDisplay);

		// If there are more items, group the rest as "Khác"
		if (sorted.length > maxDisplay) {
			const otherItems = sorted.slice(maxDisplay);
			const otherRevenue = otherItems.reduce((sum, item) => sum + item.revenue, 0);
			const otherOrders = otherItems.reduce((sum, item) => sum + item.orders, 0);

			return [
				...topItems,
				{
					kioskId: 'other',
					kioskName: 'Khác',
					revenue: otherRevenue,
					orders: otherOrders,
				},
			];
		}

		return topItems;
	}, [data, maxDisplay]);

	// Normalize orders to revenue scale for visualization
	// We'll show orders as a separate bar but scale it proportionally
	const maxRevenue = Math.max(...sortedData.map((d) => d.revenue), 1);
	const maxOrders = Math.max(...sortedData.map((d) => d.orders), 1);
	const ordersScaleFactor = maxRevenue / maxOrders;

	// Truncate kiosk names if too long
	const truncateName = (name: string, maxLength: number = 15): string => {
		if (name.length <= maxLength) return name;
		return name.substring(0, maxLength - 3) + '...';
	};

	const chartData = {
		labels: sortedData.map((d) => truncateName(d.kioskName)),
		datasets: [
			{
				label: 'Doanh thu',
				data: sortedData.map((d) => d.revenue),
				backgroundColor: 'rgba(59, 130, 246, 0.8)',
				borderColor: 'rgba(59, 130, 246, 1)',
				borderWidth: 1,
				borderRadius: 4,
				maxBarThickness: 10,
			},
			{
				label: 'Số đơn hàng',
				data: sortedData.map((d) => d.orders * ordersScaleFactor),
				backgroundColor: 'rgba(14, 165, 233, 0.6)',
				borderColor: 'rgba(14, 165, 233, 1)',
				borderWidth: 1,
				borderRadius: 4,
				maxBarThickness: 10,
			},
		],
	};

	const chartOptions = {
		indexAxis: 'y' as const,
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: true,
				position: 'top' as const,
				labels: {
					usePointStyle: true,
					padding: 15,
				},
			},
			tooltip: {
				callbacks: {
					title: (context: any) => {
						// Show full kiosk name in tooltip
						const index = context[0].dataIndex;
						return sortedData[index].kioskName;
					},
					label: (context: any) => {
						const datasetLabel = context.dataset.label || '';
						if (datasetLabel === 'Doanh thu') {
							const value = context.parsed.x;
							return `${datasetLabel}: ${new Intl.NumberFormat('vi-VN').format(value)}`;
						}
						// For orders, convert back from scaled value
						const scaledValue = context.parsed.x;
						const actualOrders = Math.round(scaledValue / ordersScaleFactor);
						return `${datasetLabel}: ${new Intl.NumberFormat('vi-VN').format(actualOrders)}`;
					},
				},
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				title: {
					display: true,
					text: 'Doanh thu',
				},
				ticks: {
					callback: (value: any) => {
						if (value >= 1000000) {
							return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
						}
						if (value >= 1000) {
							return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 0)}K`;
						}
						return value.toString();
					},
				},
				grid: {
					color: 'rgba(255, 255, 255, 0.1)',
				},
			},
			y: {
				grid: {
					display: false,
				},
			},
		},
	};

	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<Title order={4} fw={600}>
						Top doanh thu theo điểm bán
					</Title>
					<Text size='sm' c='blue' style={{ cursor: 'pointer' }}>
						Xem thêm &gt;
					</Text>
				</Group>
				<div style={{ height: '350px', position: 'relative' }}>
					<Bar data={chartData} options={chartOptions} />
				</div>
			</Stack>
		</Card>
	);
}
