import { Alert, Badge, Breadcrumbs, Card, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import {
	IconKey,
	IconLock,
	IconShield,
	IconUserCheck,
	IconUsers,
} from '@tabler/icons-react';
import React from 'react';
import { Link } from 'react-router';

import { RequestStatus } from '../../features/grantRequests';
import {
	fakeActions,
	fakeEntitlements,
	fakeGrantRequests,
	fakeResources,
	fakeRoles,
	fakeRoleSuites,
} from '../../mock/fakeData';


interface StatCardProps {
	title: string;
	value: number;
	icon: React.ReactNode;
	color: string;
	link: string;
}

function StatCard({ title, value, icon, color, link }: StatCardProps) {
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

function OverviewPageBody(): React.ReactNode {
	const pendingRequests = fakeGrantRequests.filter((r) => r.status === RequestStatus.PENDING);

	return (
		<Stack gap='md'>
			{pendingRequests.length > 0 && (
				<Alert variant='light' color='yellow' title='Pending Requests'>
					You have <strong>{pendingRequests.length}</strong> pending grant requests requiring attention.{' '}
					<Link to='/grant-requests'>View all requests</Link>
				</Alert>
			)}

			<Title order={5} mt='md'>Statistics</Title>
			<Grid>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title='Resources'
						value={fakeResources.length}
						icon={<IconLock size={32} />}
						color='var(--mantine-color-blue-6)'
						link='/resources'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title='Actions'
						value={fakeActions.length}
						icon={<IconKey size={32} />}
						color='var(--mantine-color-cyan-6)'
						link='/actions'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title='Entitlements'
						value={fakeEntitlements.length}
						icon={<IconShield size={32} />}
						color='var(--mantine-color-teal-6)'
						link='/entitlements'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title='Roles'
						value={fakeRoles.length}
						icon={<IconUserCheck size={32} />}
						color='var(--mantine-color-grape-6)'
						link='/roles'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title='Role Suites'
						value={fakeRoleSuites.length}
						icon={<IconUsers size={32} />}
						color='var(--mantine-color-violet-6)'
						link='/role-suites'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title='Grant Requests'
						value={fakeGrantRequests.length}
						icon={<IconUserCheck size={32} />}
						color='var(--mantine-color-yellow-6)'
						link='/grant-requests'
					/>
				</Grid.Col>
			</Grid>

			<Title order={5} mt='lg'>Recent Activity</Title>
			<Paper withBorder p='md'>
				<Stack gap='sm'>
					<Group justify='space-between'>
						<Group>
							<Badge color='green'>Grant</Badge>
							<Text size='sm'>
								<strong>David Pham</strong> was granted <strong>HR Manager</strong> role
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>2 hours ago</Text>
					</Group>
					<Group justify='space-between'>
						<Group>
							<Badge color='yellow'>Pending</Badge>
							<Text size='sm'>
								{/* <strong>Alice Nguyen</strong> requested <strong>Sales Representative</strong> for <strong>Bob Tran</strong> */}
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>4 hours ago</Text>
					</Group>
					<Group justify='space-between'>
						<Group>
							<Badge color='red'>Revoke</Badge>
							<Text size='sm'>
								<strong>Henry Tran</strong> had <strong>Sales Manager</strong> role revoked
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>1 day ago</Text>
					</Group>
				</Stack>
			</Paper>

			<Title order={5} mt='lg'>Quick Links</Title>
			<Grid>
				<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
					<Paper withBorder p='md' component={Link} to='/resources' style={{ textDecoration: 'none', color: 'inherit' }}>
						<Text fw={500}>Manage Resources</Text>
						<Text size='sm' c='dimmed'>Define and manage protected resources</Text>
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
					<Paper withBorder p='md' component={Link} to='/roles' style={{ textDecoration: 'none', color: 'inherit' }}>
						<Text fw={500}>Manage Roles</Text>
						<Text size='sm' c='dimmed'>Create and assign roles to users</Text>
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
					<Paper withBorder p='md' component={Link} to='/grant-requests' style={{ textDecoration: 'none', color: 'inherit' }}>
						<Text fw={500}>Process Requests</Text>
						<Text size='sm' c='dimmed'>Review and approve grant requests</Text>
					</Paper>
				</Grid.Col>
			</Grid>
		</Stack>
	);
}

export const OverviewPage: React.FC = withWindowTitle('Authorize Overview - Nikki ERP', OverviewPageBody);

