/* eslint-disable max-lines-per-function */
import { Avatar, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconCurrencyDollar, IconShoppingCart, IconUsers } from '@tabler/icons-react';
import React from 'react';


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
						<Group gap={'xs'} align='center'>
							<IconCurrencyDollar size={22} />
							<Text size='lg' c='yellow' fw={600}>{earnings}</Text>
							<Text size='sm'>Earnings</Text>
						</Group>
						<Group gap='xs' align='center'>
							<IconShoppingCart size={20} />
							<Text size='lg' c='dimmed' fw={600}>{orders.toLocaleString()}</Text>
							<Text size='sm'>Orders</Text>
						</Group>
						<Group gap='xs' align='center'>
							<IconUsers size={20} />
							<Text size='lg' c='dimmed' fw={600}>{visitors.toLocaleString()}</Text>
							<Text size='sm'>Visitors</Text>
						</Group>
					</Group>
				</Stack>

				{/* <Stack gap='xs'>
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
				</Stack> */}

				<Stack gap='xs'>
					<Card padding='xs' withBorder radius='sm'>
						<Group justify='space-between' align='center'>
							<Avatar size='sm' radius='sm' color='blue' />
							<Stack gap={3} flex={1}>
								<Group gap={0} justify='space-between'>
									<Text size='sm' fw={500}>
										Average Revenue
									</Text>
									<Text size='sm' c='yellow' fw={600}>
										8.2Tr VND
									</Text>
								</Group>
								<Group gap={0} justify='space-between' flex={1}>
									<Text size='sm' fw={500}>
										Average revenue per order
									</Text>
									<Text size='sm' c='yellow' fw={600}>
										20,000 VND
									</Text>
								</Group>
							</Stack>
						</Group>
					</Card>

					<Card padding='xs' withBorder radius='sm'>
						<Group justify='space-between' align='center'>
							<Avatar size='sm' radius='sm' color='blue' />
							<Stack gap={3} flex={1}>
								<Group gap={0} justify='space-between' flex={1}>
									<Text size='sm' fw={500}>
										Items Sold
									</Text>
									<Text size='sm' c='dimmed' fw={600}>
										100 items
									</Text>
								</Group>
								<Group gap={0} justify='space-between' flex={1}>
									<Text size='sm' fw={500}>
										Items Errored
									</Text>
									<Text size='sm' c='dimmed' fw={600}>
										0 items
									</Text>
								</Group>
								<Group gap={0} justify='space-between' flex={1}>
									<Text size='sm' fw={500}>
										Error rate (%)
									</Text>
									<Text size='sm' c='dimmed' fw={600}>
										0%
									</Text>
								</Group>
							</Stack>
						</Group>
					</Card>

					<Card padding='xs' withBorder radius='sm'>
						<Group justify='space-between' align='center'>
							<Avatar size='sm' radius='sm' color='blue' />
							<Stack gap={3} flex={1}>
								<Group gap={0} justify='space-between' flex={1}>
									<Text size='sm' fw={500}>
										Refunded Orders
									</Text>
									<Text size='sm' c='dimmed' fw={600}>
										0 orders
									</Text>
								</Group>
								<Group gap={0} justify='space-between' flex={1}>
									<Text size='sm' fw={500}>
										Refund rate (%)
									</Text>
									<Text size='sm' c='dimmed' fw={600}>
										0%
									</Text>
								</Group>
							</Stack>
						</Group>
					</Card>
				</Stack>
				<Button variant='subtle' size='xs' fullWidth>
					View all reports &gt;
				</Button>
			</Stack>
		</Card>
	);
}
