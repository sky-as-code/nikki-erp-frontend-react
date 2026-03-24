/* eslint-disable max-lines-per-function */
import { ActionIcon, Card, Group, Select, Stack, Text, Title } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';


ChartJS.register(ArcElement, Tooltip, Legend);

interface MarketShareItem {
	name: string;
	value: number;
	percentage: number;
	change: number;
	color: string;
}

interface MarketShareChartProps {
	totalTransactions: string;
	items: MarketShareItem[];
}

export function MarketShareChart({ totalTransactions, items }: MarketShareChartProps): React.ReactElement {
	const data = {
		labels: items.map((item) => item.name),
		datasets: [
			{
				data: items.map((item) => item.value),
				backgroundColor: items.map((item) => item.color),
				borderColor: items.map((item) => item.color),
				borderWidth: 1,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		cutout: '70%',
		plugins: {
			legend: {
				display: false,
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
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<Stack gap={4}>
						<Title order={4} fw={600}>
							Market Share
						</Title>
						<Text size='xs' c='dimmed'>
							Amount of revenue in one month
						</Text>
					</Stack>
					<Group gap='xs'>
						<Select
							placeholder='Last month'
							data={['Last month', 'Last week', 'Last year']}
							defaultValue='Last month'
							size='xs'
							w={120}
						/>
						<ActionIcon variant='subtle' size='sm'>
							<IconSettings size={16} />
						</ActionIcon>
					</Group>
				</Group>
				<div style={{ height: '250px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<Doughnut data={data} options={options} />
					<div style={{ position: 'absolute', textAlign: 'center' }}>
						<Text size='xs' c='dimmed'>Total transactions</Text>
						<Title order={3} fw={600}>{totalTransactions}</Title>
					</div>
				</div>
				<Stack gap='xs'>
					{items.map((item) => (
						<Group key={item.name} justify='space-between' align='center'>
							<Group gap='xs'>
								<div
									style={{
										width: '4px',
										height: '20px',
										backgroundColor: item.color,
										borderRadius: '2px',
									}}
								/>
								<Text size='sm' fw={500}>
									{item.name}
								</Text>
							</Group>
							<Group gap='md'>
								<Text size='sm' fw={500}>
									{item.percentage}%
								</Text>
								<Text size='sm' c={item.change >= 0 ? 'green' : 'red'}>
									{item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
								</Text>
							</Group>
						</Group>
					))}
				</Stack>
			</Stack>
		</Card>
	);
}
