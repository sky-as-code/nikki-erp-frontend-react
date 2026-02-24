/* eslint-disable max-lines-per-function */
import { Card, Group, Radio, Stack, Text, Title } from '@mantine/core';
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

interface QuarterData {
	quarter: string; // e.g., "2023 Q1"
	revenue: number; // Revenue in thousands
	orders: number; // Number of orders
}

interface RevenueChartProps {
	data: QuarterData[];
}

export function RevenueChart({ data }: RevenueChartProps): React.ReactElement {
	const [activeTab, setActiveTab] = useState<string | null>('revenue');

	const chartData = {
		labels: data.map((d) => d.quarter),
		datasets: [
			{
				label: activeTab === 'revenue' ? 'Doanh thu' : 'Số đơn hàng',
				data: activeTab === 'revenue' ? data.map((d) => d.revenue) : data.map((d) => d.orders),
				backgroundColor: activeTab === 'revenue' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(14, 165, 233, 0.6)',
				borderColor: activeTab === 'revenue' ? 'rgba(59, 130, 246, 1)' : 'rgba(14, 165, 233, 1)',
				borderWidth: 1,
				borderRadius: 4,
				maxBarThickness: 30,
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
					boxWidth: 12,
					boxHeight: 12,
				},
			},
			tooltip: {
				callbacks: {
					label: (context: any) => {
						const value = context.parsed.y;
						if (activeTab === 'revenue') {
							return `Doanh thu: ${new Intl.NumberFormat('vi-VN').format(value)}k`;
						}
						return `Số đơn hàng: ${new Intl.NumberFormat('vi-VN').format(value)}`;
					},
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: activeTab === 'revenue' ? 'Doanh thu (k)' : 'Số đơn hàng',
				},
				ticks: {
					callback: (value: any) => {
						if (activeTab === 'revenue') {
							return `${value}k`;
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
					<Stack gap={4}>
						<Title order={4} fw={600}>
							Revenue Overview
						</Title>
						<Text size='xs' c='dimmed'>
							Overview of revenue and orders
						</Text>
					</Stack>
					<Radio.Group value={activeTab} onChange={setActiveTab}>
						<Group gap='md'>
							<Radio value='revenue' label='Doanh thu' size='xs' />
							<Radio value='orders' label='Số đơn hàng' size='xs' />
						</Group>
					</Radio.Group>
				</Group>
				<div style={{ height: '330px', position: 'relative' }}>
					<Bar data={chartData} options={chartOptions} />
				</div>
			</Stack>
		</Card>
	);
}
