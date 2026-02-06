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
import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface HourlyData {
	hour: number; // 0-23
	revenue: number;
	orders: number;
}

interface RevenueByHourProps {
	data: HourlyData[];
}

export function RevenueByHour({ data }: RevenueByHourProps): React.ReactElement {
	const [activeTab, setActiveTab] = useState<string | null>('revenue');

	const hours = Array.from({ length: 24 }, (_, i) => i);
	const hourlyDataMap = new Map(data.map((d) => [d.hour, d]));

	const revenueData = hours.map((hour) => hourlyDataMap.get(hour)?.revenue || 0);
	const ordersData = hours.map((hour) => hourlyDataMap.get(hour)?.orders || 0);

	const chartData = {
		labels: hours.map((h) => `${h.toString().padStart(2, '0')}h`),
		datasets: [
			{
				label: activeTab === 'revenue' ? 'Doanh thu' : 'Số đơn hàng',
				data: activeTab === 'revenue' ? revenueData : ordersData,
				backgroundColor: 'rgba(59, 130, 246, 0.8)',
				borderColor: 'rgba(59, 130, 246, 1)',
				borderWidth: 1,
				borderRadius: 4,
				maxBarThickness: 20,
			},
		],
	};

	const chartOptions = {
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
					label: (context: any) => {
						const value = context.parsed.y;
						if (activeTab === 'revenue') {
							return `Doanh thu: ${new Intl.NumberFormat('vi-VN').format(value)}`;
						}
						return `Số đơn hàng: ${new Intl.NumberFormat('vi-VN').format(value)}`;
					},
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: {
					callback: (value: any) => {
						if (activeTab === 'revenue') {
							if (value >= 1000000) {
								return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
							}
							if (value >= 1000) {
								return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 0)}K`;
							}
							return value.toString();
						}
						return value.toString();
					},
				},
				grid: {
					color: 'rgba(255, 255, 255, 0.1)',
				},
			},
			x: {
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
						Doanh thu theo giờ
					</Title>
					<Radio.Group value={activeTab} onChange={setActiveTab}>
						<Group gap='md'>
							<Radio value='revenue' label='Doanh thu' size='xs' />
							<Radio value='orders' label='Số đơn hàng' size='xs' />
						</Group>
					</Radio.Group>
				</Group>
				<div style={{ height: '350px', position: 'relative' }}>
					<Bar data={chartData} options={chartOptions} />
				</div>
			</Stack>
		</Card>
	);
}
