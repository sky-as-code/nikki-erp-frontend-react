import {
	Card,
	Group,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from '@mantine/core';
import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router';

import classes from './GroupedStatCard.module.css';


interface StatItem {
	label: string;
	value: number | string;
	icon?: React.ReactNode;
	color?: string;
	suffix?: string;
	link?: string;
}

interface GroupedStatCardProps {
	title: string;
	icon?: React.ReactNode;
	iconColor?: string;
	items: StatItem[];
	link?: string;
}

export function GroupedStatCard({
	title,
	icon,
	iconColor = 'blue',
	items,
	link,
}: GroupedStatCardProps): React.ReactElement {

	const cardProps = link
		? { component: Link as any, to: link }
		: { component: 'div' as const };

	return (
		<Card
			{...cardProps}
			shadow='lg' padding='lg' radius='md' withBorder
			className={clsx(classes.card, classes.cardLink)}
		>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<Text size='sm' fw={600}>
						{title}
					</Text>
					{icon && (
						<ThemeIcon size='lg' radius='md' variant='light' color={iconColor}>
							{icon}
						</ThemeIcon>
					)}
				</Group>
				<Stack gap='sm'>
					{items.map((item, index) => (
						<Group key={index} justify='space-between' align='center'>
							<Group gap='xs' align='center'>
								{item.icon && (
									<ThemeIcon size='sm' radius='sm' variant='light' color={item.color || 'gray'}>
										{item.icon}
									</ThemeIcon>
								)}
								<Text size='sm'>
									{item.label}
								</Text>
							</Group>
							<Title order={3} fz={{ base: 'md', sm: 'lg' }}>
								{item.value}{item.suffix && ` ${item.suffix}`}
							</Title>
						</Group>
					))}
				</Stack>
			</Stack>
		</Card>
	);
}
