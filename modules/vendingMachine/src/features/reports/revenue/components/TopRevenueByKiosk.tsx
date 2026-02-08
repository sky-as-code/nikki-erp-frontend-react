/* eslint-disable max-lines-per-function */
import { Card, Group, Radio, Stack, Title } from '@mantine/core';
import {
	CategoryScale,
	Chart as ChartJS,
	LinearScale,
	BarElement,
	Tooltip,
	Legend,
} from 'chart.js';
import React, { useMemo, useState } from 'react';
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
	const [activeTab, setActiveTab] = useState<string | null>('revenue');

	// Sort by revenue or orders descending based on active tab
	const sortedData = useMemo(() => {
		const sorted = [...data].sort((a, b) => {
			if (activeTab === 'revenue') {
				return b.revenue - a.revenue;
			}
			return b.orders - a.orders;
		});
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
	}, [data, maxDisplay, activeTab]);

	// Truncate kiosk names if too long
	const truncateName = (name: string, maxLength: number = 25): string => {
		if (name.length <= maxLength) return name;
		return name.substring(0, maxLength - 3) + '...';
	};

	const chartData = {
		labels: sortedData.map((d) => truncateName(d.kioskName)),
		datasets: [
			{
				label: activeTab === 'revenue' ? 'Doanh thu' : 'Số đơn hàng',
				data: activeTab === 'revenue'
					? sortedData.map((d) => d.revenue)
					: sortedData.map((d) => d.orders),
				backgroundColor: activeTab === 'revenue' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(14, 165, 233, 0.6)',
				borderColor: activeTab === 'revenue' ? 'rgba(59, 130, 246, 1)' : 'rgba(14, 165, 233, 1)',
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
						const value = context.parsed.x;
						if (activeTab === 'revenue') {
							return `Doanh thu: ${new Intl.NumberFormat('vi-VN').format(value)}`;
						}
						return `Số đơn hàng: ${new Intl.NumberFormat('vi-VN').format(value)}`;
					},
				},
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				title: {
					display: true,
					text: activeTab === 'revenue' ? 'Doanh thu' : 'Số đơn hàng',
				},
				ticks: {
					callback: (value: any) => {
						if (activeTab === 'revenue') {
							if (value >= 1000000) {
								return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
							}
							if (value >= 1000) {
								return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 0)}K`;
							}
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
				<Group justify='space-between' align='center'>
					<Title order={4} fw={600}>
						Top doanh thu theo điểm bán
					</Title>
					<Group gap='md'>
						<Radio.Group value={activeTab} onChange={setActiveTab}>
							<Group gap='md'>
								<Radio value='revenue' label='Doanh thu' size='xs' />
								<Radio value='orders' label='Số đơn hàng' size='xs' />
							</Group>
						</Radio.Group>
					</Group>
				</Group>
				<div style={{ height: '350px', position: 'relative' }}>
					<Bar data={chartData} options={chartOptions} />
				</div>
			</Stack>
		</Card>
	);
}
