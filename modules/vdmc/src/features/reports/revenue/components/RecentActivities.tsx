import { Card, Group, Select, Stack, Text, Title } from '@mantine/core';
import React from 'react';
import { IconCalendar, IconCurrencyDollar, IconHelp, IconShoppingBag } from '@tabler/icons-react';

interface Activity {
	id: string;
	type: 'purchase' | 'order' | 'question' | 'event';
	description: string;
	timeAgo: string;
}

interface RecentActivitiesProps {
	activities: Activity[];
}

const getActivityIcon = (type: Activity['type']) => {
	switch (type) {
		case 'purchase':
			return <IconCurrencyDollar size={18} />;
		case 'order':
			return <IconShoppingBag size={18} />;
		case 'question':
			return <IconHelp size={18} />;
		case 'event':
			return <IconCalendar size={18} />;
		default:
			return null;
	}
};

export function RecentActivities({ activities }: RecentActivitiesProps): React.ReactElement {
	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<Stack gap={4}>
						<Title order={4} fw={600}>
							Recent activities
						</Title>
						<Text size='xs' c='dimmed'>
							Details on shopping composition
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
				<Stack gap='md'>
					{activities.map((activity) => (
						<Group key={activity.id} gap='sm' align='flex-start'>
							<div style={{ marginTop: '2px' }}>{getActivityIcon(activity.type)}</div>
							<Stack gap={2} style={{ flex: 1 }}>
								<Text size='sm'>{activity.description}</Text>
								<Text size='xs' c='dimmed'>
									{activity.timeAgo}
								</Text>
							</Stack>
						</Group>
					))}
				</Stack>
			</Stack>
		</Card>
	);
}
