import { Avatar, Button, Card, Group, ScrollArea, Stack, Text, Title } from '@mantine/core';
import React from 'react';
import { IconCurrencyDollar, IconShoppingCart, IconUsers } from '@tabler/icons-react';

interface Order {
	id: string;
	name: string;
	price: number;
	image?: string;
}

interface WelcomeCardProps {
	date: string;
	greeting: string;
	visitors: number;
	earnings: string;
	orders: number;
	ordersToday: number;
	topOrders: Order[];
}

export function WelcomeCard({
	date,
	greeting,
	visitors,
	earnings,
	orders,
	ordersToday,
	topOrders,
}: WelcomeCardProps): React.ReactElement {
	return (
		<Card shadow='sm' padding='md' radius='md' withBorder>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<Stack gap={4}>
						<Text size='sm' c='dimmed'>
							{date}
						</Text>
						<Title order={3} fw={600}>
							{greeting}
						</Title>
					</Stack>
				</Group>

				<Stack gap='xs'>
					<Text size='sm' fw={500}>
						Updates from yesterday.
					</Text>
					<Group gap='lg'>
						<Group gap='xs'>
							<IconUsers size={20} />
							<Text size='sm'>{visitors.toLocaleString()} Visitors</Text>
						</Group>
						<Group gap='xs'>
							<IconCurrencyDollar size={20} />
							<Text size='sm'>{earnings} Earnings</Text>
						</Group>
						<Group gap='xs'>
							<IconShoppingCart size={20} />
							<Text size='sm'>{orders.toLocaleString()} Orders</Text>
						</Group>
					</Group>
				</Stack>

				<Stack gap='xs'>
					<Text size='sm' fw={500}>
						You have {ordersToday} orders today.
					</Text>
					<ScrollArea h={200}>
						<Stack gap='xs'>
							{topOrders.map((order) => (
								<Card key={order.id} padding='xs' withBorder radius='sm'>
									<Group justify='space-between' align='center'>
										<Group gap='xs'>
											<Avatar size='sm' radius='sm' color='blue' />
											<Stack gap={0}>
												<Text size='sm' fw={500}>
													{order.name}
												</Text>
												<Text size='xs' c='dimmed'>
													${order.price.toFixed(2)}
												</Text>
											</Stack>
										</Group>
									</Group>
								</Card>
							))}
						</Stack>
					</ScrollArea>
				</Stack>

				<Button variant='subtle' size='xs' fullWidth>
					All orders &gt;
				</Button>
			</Stack>
		</Card>
	);
}
