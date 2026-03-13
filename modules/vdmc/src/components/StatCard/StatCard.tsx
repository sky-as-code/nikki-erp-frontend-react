import {
	Card,
	Group,
	Stack,
	Text,
	Title,
	ThemeIcon,
} from '@mantine/core';
import React from 'react';
import { Link } from 'react-router';


interface StatCardProps {
	title: string;
	value: number | string;
	icon: React.ReactNode;
	color: string;
	link?: string;
	suffix?: string;
}

export function StatCard({ title, value, icon, color, link, suffix }: StatCardProps): React.ReactElement {
	const cardProps = link
		? { component: Link as any, to: link }
		: { component: 'div' as const };

	return (
		<Card
			{...cardProps}
			shadow='lg'
			padding='lg'
			radius='md'
			withBorder
			style={{
				cursor: link ? 'pointer' : 'default',
				transition: 'transform 0.2s',
				height: '100%',
				backgroundColor: 'var(--mantine-color-body)',
				backdropFilter: 'blur(10px)',
				opacity: 0.95,
			}}
			onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { if (link) e.currentTarget.style.transform = 'translateY(-4px)'; }}
			onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { if (link) e.currentTarget.style.transform = 'translateY(0)'; }}
		>
			<Group justify='space-between' align='flex-start'>
				<Stack gap='xs'>
					<Text size='sm' c='dimmed' fw={500}>
						{title}
					</Text>
					<Title order={2}>
						{value}{suffix && ` ${suffix}`}
					</Title>
				</Stack>
				<ThemeIcon size='xl' radius='md' variant='light' color={color}>
					{icon}
				</ThemeIcon>
			</Group>
		</Card>
	);
}
