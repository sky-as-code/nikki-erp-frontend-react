import { Card, Stack, Text, Title } from '@mantine/core';
import React from 'react';


interface MetricCardProps {
	title: string;
	subtitle: string;
	value: string;
	change?: {
		value: string;
		isPositive: boolean;
	};
	chart?: React.ReactNode;
}

export function MetricCard({ title, subtitle, value, change, chart }: MetricCardProps): React.ReactElement {
	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='xs'>
				<Text size='sm' c='dimmed' fw={500}>
					{title}
				</Text>
				<Text size='xs' c='dimmed'>
					{subtitle}
				</Text>
				<Title order={2} fw={600}>
					{value}
				</Title>
				{change && (
					<Text size='sm' c={change.isPositive ? 'green' : 'red'}>
						{change.isPositive ? '+' : ''}{change.value}
					</Text>
				)}
				{chart && <div style={{ height: '80px', marginTop: '8px' }}>{chart}</div>}
			</Stack>
		</Card>
	);
}
