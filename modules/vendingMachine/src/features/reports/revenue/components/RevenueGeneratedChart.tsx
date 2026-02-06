/* eslint-disable max-lines-per-function */
import { Card, Stack, Text, Title } from '@mantine/core';
import {
	CategoryScale,
	Chart as ChartJS,
	LinearScale,
	BarElement,
	Tooltip,
	Legend,
} from 'chart.js';
import React from 'react';
import { Bar } from 'react-chartjs-2';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface QuarterData {
	quarter: string; // e.g., "2023 Q1"
	revenue: number; // Revenue in thousands
	orders: number; // Number of orders
}

interface RevenueGeneratedChartProps {
	data: QuarterData[];
}

export function RevenueGeneratedChart({ data }: RevenueGeneratedChartProps): React.ReactElement {
	const chartData = {
		labels: data.map((d) => d.quarter),
		datasets: [
			{
				label: 'Doanh thu',
				data: data.map((d) => d.revenue),
				backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue
				borderColor: 'rgba(59, 130, 246, 1)',
				borderWidth: 1,
				borderRadius: 4,
				maxBarThickness: 20,
				yAxisID: 'y',
			},
			{
				label: 'Số đơn hàng',
				data: data.map((d) => d.orders),
				backgroundColor: 'rgba(14, 165, 233, 0.6)', // light blue
				borderColor: 'rgba(14, 165, 233, 1)',
				borderWidth: 1,
				borderRadius: 4,
				maxBarThickness: 20,
				yAxisID: 'y1',
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
						const datasetLabel = context.dataset.label || '';
						const value = context.parsed.y;
						if (datasetLabel === 'Doanh thu') {
							return `${datasetLabel}: ${new Intl.NumberFormat('vi-VN').format(value)}k`;
						}
						return `${datasetLabel}: ${new Intl.NumberFormat('vi-VN').format(value)}`;
					},
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: 'Doanh thu (k)',
				},
				ticks: {
					callback: (value: any) => {
						return `${value}k`;
					},
				},
				grid: {
					color: 'rgba(255, 255, 255, 0.1)',
				},
			},
			y1: {
				type: 'linear' as const,
				position: 'right' as const,
				title: {
					display: true,
					text: 'Số đơn hàng',
				},
				ticks: {
					callback: (value: any) => {
						return value.toString();
					},
				},
				grid: {
					display: false,
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
				<Stack gap={4}>
					<Title order={4} fw={600}>
						Revenue Overview
					</Title>
					<Text size='xs' c='dimmed'>
						Overview of revenue and orders
					</Text>
				</Stack>
				<div style={{ height: '330px', position: 'relative' }}>
					<Bar data={chartData} options={chartOptions} />
				</div>
			</Stack>
		</Card>
	);
}
