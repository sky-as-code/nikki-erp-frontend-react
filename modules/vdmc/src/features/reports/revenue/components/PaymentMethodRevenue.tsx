/* eslint-disable max-lines-per-function */
import { Card, Group, Progress, Stack, Text, Title } from '@mantine/core';
import React, { useMemo } from 'react';

import { usePaymentList, type PaymentMethod } from '@/features/payment';


interface PaymentMethodRevenueData {
	paymentMethodId: string;
	revenue: number;
	percentage?: number; // Optional, will be calculated if not provided
}

interface PaymentMethodRevenueProps {
	data: PaymentMethodRevenueData[];
}

// Color palette for payment methods
const PAYMENT_COLORS = [
	'rgba(59, 130, 246, 0.8)',   // blue
	'rgba(34, 197, 94, 0.8)',     // green
	'rgba(168, 85, 247, 0.8)',    // purple
	'rgba(251, 146, 60, 0.8)',   // orange
	'rgba(239, 68, 68, 0.8)',    // red
	'rgba(236, 72, 153, 0.8)',   // pink
	'rgba(14, 165, 233, 0.8)',   // sky blue
	'rgba(34, 197, 94, 0.8)',     // emerald
];

export function PaymentMethodRevenue({ data }: PaymentMethodRevenueProps): React.ReactElement {
	const { payments } = usePaymentList();

	// Calculate total revenue and percentages
	const totalRevenue = useMemo(() => {
		return data.reduce((sum, item) => sum + item.revenue, 0);
	}, [data]);

	// Map payment method IDs to payment methods and calculate colors and percentages
	const paymentMethodData = useMemo(() => {
		return data.map((item, index) => {
			const paymentMethod = payments?.find((p: PaymentMethod) => p.id === item.paymentMethodId);
			const percentage = item.percentage !== undefined
				? item.percentage
				: totalRevenue > 0
					? (item.revenue / totalRevenue) * 100
					: 0;
			return {
				...item,
				percentage,
				name: paymentMethod?.name || `Payment Method ${index + 1}`,
				color: PAYMENT_COLORS[index % PAYMENT_COLORS.length],
			};
		});
	}, [data, payments, totalRevenue]);

	const segments = paymentMethodData.map((item) => ({
		value: item.percentage,
		color: item.color,
		label: item.name,
	}));

	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='md'>
				<Stack gap={4}>
					<Title order={4} fw={600}>
						Revenue by Payment Method
					</Title>
					<Text size='xs' c='dimmed'>
						Total revenue distribution by payment methods
					</Text>
				</Stack>
				<Stack gap='xs'>
					{paymentMethodData.map((item) => (
						<Group key={item.paymentMethodId} justify='space-between' align='center'>
							<Group gap='xs'>
								<div
									style={{
										width: '12px',
										height: '12px',
										backgroundColor: item.color,
										borderRadius: '2px',
									}}
								/>
								<Text size='sm'>{item.name}</Text>
							</Group>
							<Group gap='xs'>
								<Text size='sm' fw={500}>
									{new Intl.NumberFormat('en-US', {
										style: 'currency',
										currency: 'USD',
										minimumFractionDigits: 0,
										maximumFractionDigits: 0,
									}).format(item.revenue)}
								</Text>
								<Text size='sm' c='dimmed' fw={500}>
									({item.percentage.toFixed(1)}%)
								</Text>
							</Group>
						</Group>
					))}
				</Stack>
				<Progress.Root size='lg' radius='md'>
					{segments.map((segment, index) => (
						<Progress.Section
							key={index}
							value={segment.value}
							color={segment.color}
						/>
					))}
				</Progress.Root>
				{totalRevenue > 0 && (
					<Text size='xs' c='dimmed' ta='right'>
						Total: {new Intl.NumberFormat('en-US', {
							style: 'currency',
							currency: 'USD',
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						}).format(totalRevenue)}
					</Text>
				)}
			</Stack>
		</Card>
	);
}
