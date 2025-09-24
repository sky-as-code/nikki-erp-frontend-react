import { Container, Text, Card, SimpleGrid } from '@mantine/core';
import { IconUsers, IconCode, IconServer, IconStar } from '@tabler/icons-react';

import classes from './SocialProofSection.module.css';

interface StatCardProps {
	icon: React.ReactNode;
	label: string;
	value: string;
}

function StatCard({
	icon, label, value,
}: StatCardProps) {
	return (
		<Card className={classes.statCard} padding='lg'>
			<div className={classes.statIcon}>{icon}</div>
			<Text size='xl' fw={700} className={classes.statValue}>
				{value}
			</Text>
			<Text size='sm' c='dimmed'>
				{label}
			</Text>
		</Card>
	);
}

export function SocialProofSection() {
	const stats = [
		{
			icon: <IconUsers className={classes.icon} />,
			label: 'Active Users',
			value: '10,000+',
		},
		{
			icon: <IconCode className={classes.icon} />,
			label: 'Code Deployments',
			value: '500K+',
		},
		{
			icon: <IconServer className={classes.icon} />,
			label: 'Cloud Servers',
			value: '100+',
		},
		{
			icon: <IconStar className={classes.icon} />,
			label: 'Customer Rating',
			value: '4.9/5',
		},
	];

	return (
		<Container size='lg' py={80}>
			<Text ta='center' fw={700} fz='xl' mb='xl'>
				Trusted by Thousands of Developers
			</Text>

			<SimpleGrid cols={{
				base: 1, sm: 2, md: 4,
			}} spacing='xl'>
				{stats.map((stat, index) => (
					<StatCard key={index} {...stat} />
				))}
			</SimpleGrid>
		</Container>
	);
}
