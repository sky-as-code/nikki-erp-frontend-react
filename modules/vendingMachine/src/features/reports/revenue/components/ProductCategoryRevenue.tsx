import { ActionIcon, Card, Group, Select, Stack, Text, Title } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';


ChartJS.register(ArcElement, Tooltip, Legend);

interface ProductCategoryItem {
	name: string;
	revenue: number;
	percentage: number;
	change: number;
	color: string;
}

interface ProductCategoryRevenueProps {
	totalRevenue: string;
	items: ProductCategoryItem[];
}

const MAX_DISPLAY_ITEMS = 5;
const OTHER_CATEGORY_COLOR = 'rgba(156, 163, 175, 0.8)'; // gray

export function ProductCategoryRevenue({ totalRevenue, items }: ProductCategoryRevenueProps): React.ReactElement {
	// Group items if there are more than MAX_DISPLAY_ITEMS
	const processedItems = useMemo(() => {
		if (items.length <= MAX_DISPLAY_ITEMS) {
			return items;
		}

		// Sort by revenue descending
		const sortedItems = [...items].sort((a, b) => b.revenue - a.revenue);
		
		// Take top MAX_DISPLAY_ITEMS - 1 (to leave room for "Other")
		const topItems = sortedItems.slice(0, MAX_DISPLAY_ITEMS - 1);
		
		// Group remaining items into "Other"
		const otherItems = sortedItems.slice(MAX_DISPLAY_ITEMS - 1);
		const otherRevenue = otherItems.reduce((sum, item) => sum + item.revenue, 0);
		const totalRevenueValue = items.reduce((sum, item) => sum + item.revenue, 0);
		const otherPercentage = totalRevenueValue > 0 ? (otherRevenue / totalRevenueValue) * 100 : 0;
		
		// Calculate average change for "Other" category
		const otherChange = otherItems.length > 0
			? otherItems.reduce((sum, item) => sum + item.change, 0) / otherItems.length
			: 0;

		return [
			...topItems,
			{
				name: 'Khác',
				revenue: otherRevenue,
				percentage: otherPercentage,
				change: otherChange,
				color: OTHER_CATEGORY_COLOR,
			},
		];
	}, [items]);

	const data = {
		labels: processedItems.map((item) => item.name),
		datasets: [
			{
				data: processedItems.map((item) => item.revenue),
				backgroundColor: processedItems.map((item) => item.color),
				borderColor: processedItems.map((item) => item.color),
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
						const revenueFormatted = new Intl.NumberFormat('en-US', {
							style: 'currency',
							currency: 'USD',
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						}).format(value);
						return `${label}: ${revenueFormatted} (${percentage}%)`;
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
							Revenue by Product Category
						</Title>
						<Text size='xs' c='dimmed'>
							Total revenue distribution by product categories
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
						<Text size='xs' c='dimmed'>Total revenue</Text>
						<Title order={3} fw={600}>{totalRevenue}</Title>
					</div>
				</div>
				<Stack gap='xs'>
					{processedItems.map((item) => (
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
									{item.percentage.toFixed(1)}%
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
