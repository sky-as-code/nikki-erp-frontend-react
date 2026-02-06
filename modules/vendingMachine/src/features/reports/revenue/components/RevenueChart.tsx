import { Card, Checkbox, Group, Select, Stack, Text, Title } from '@mantine/core';
import {
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
} from 'chart.js';
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
);

interface RevenueDataPoint {
	date: string;
	lastYear: number;
	thisYear: number;
}

interface RevenueChartProps {
	data: RevenueDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps): React.ReactElement {
	const [showLastYear, setShowLastYear] = useState(true);
	const [showThisYear, setShowThisYear] = useState(true);

	const chartData = {
		labels: data.map((d) => {
			const date = new Date(d.date);
			return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
		}),
		datasets: [
			{
				label: 'Last year',
				data: showLastYear ? data.map((d) => d.lastYear) : [],
				borderColor: 'rgba(156, 163, 175, 0.8)',
				backgroundColor: 'rgba(156, 163, 175, 0.1)',
				tension: 0.4,
				borderWidth: 2,
			},
			{
				label: 'This year +6.19%',
				data: showThisYear ? data.map((d) => d.thisYear) : [],
				borderColor: 'rgba(59, 130, 246, 0.8)',
				backgroundColor: 'rgba(59, 130, 246, 0.1)',
				tension: 0.4,
				borderWidth: 2,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		interaction: {
			mode: 'index' as const,
			intersect: false,
		},
		plugins: {
			legend: {
				display: false,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
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
				<Group justify='space-between' align='flex-start'>
					<Stack gap={4}>
						<Title order={4} fw={600}>
							Revenue Generated
						</Title>
						<Text size='xs' c='dimmed'>
							Amount of revenue in this month comparing to last year
						</Text>
					</Stack>
					<Select
						placeholder='Last month'
						data={['Last month', 'Last week', 'Last year']}
						defaultValue='Last month'
						size='xs'
						w={120}
					/>
				</Group>
				<Group gap='md'>
					<Checkbox
						label='Last year'
						checked={showLastYear}
						onChange={(e) => setShowLastYear(e.currentTarget.checked)}
						size='xs'
					/>
					<Checkbox
						label='This year +6.19%'
						checked={showThisYear}
						onChange={(e) => setShowThisYear(e.currentTarget.checked)}
						size='xs'
					/>
				</Group>
				<div style={{ height: '300px', position: 'relative' }}>
					<Line data={chartData} options={options} />
				</div>
			</Stack>
		</Card>
	);
}
