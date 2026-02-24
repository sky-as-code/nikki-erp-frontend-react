import { Card, Group, Progress, Stack, Text, Title } from '@mantine/core';
import React from 'react';


interface StorageCategory {
	name: string;
	percentage: number;
	color: string;
}

interface StorageUsageProps {
	categories: StorageCategory[];
}

export function StorageUsage({ categories }: StorageUsageProps): React.ReactElement {
	const segments = categories.map((cat) => ({
		value: cat.percentage,
		color: cat.color,
		label: cat.name,
	}));

	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='md'>
				<Stack gap={4}>
					<Title order={4} fw={600}>
						Storage Usage
					</Title>
					<Text size='xs' c='dimmed'>
						Product categories occupying warehouse space
					</Text>
				</Stack>
				<Stack gap='xs'>
					{categories.map((category) => (
						<Group key={category.name} justify='space-between' align='center'>
							<Group gap='xs'>
								<div
									style={{
										width: '12px',
										height: '12px',
										backgroundColor: category.color,
										borderRadius: '2px',
									}}
								/>
								<Text size='sm'>{category.name}</Text>
							</Group>
							<Text size='sm' fw={500}>
								{category.percentage}%
							</Text>
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
			</Stack>
		</Card>
	);
}
