import { Card, Text, Group } from '@mantine/core';
import { Link } from 'react-router';


export interface StatCardProps {
	title: string;
	value: number;
	icon: React.ReactNode;
	color: string;
	link: string;
}

export function StatCard({ title, value, icon, color, link }: StatCardProps) {
	return (
		<Card withBorder padding='lg' component={Link} to={link} style={{ textDecoration: 'none', color: 'inherit' }}>
			<Group justify='space-between'>
				<div>
					<Text size='xs' c='dimmed' tt='uppercase' fw={700}>
						{title}
					</Text>
					<Text size='xl' fw={700} mt='xs'>
						{value}
					</Text>
				</div>
				<div style={{ color }}>
					{icon}
				</div>
			</Group>
		</Card>
	);
}
