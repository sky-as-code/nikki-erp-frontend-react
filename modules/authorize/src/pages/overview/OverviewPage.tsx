import { Alert, Badge, Card, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core';
import {
	IconKey,
	IconLock,
	IconShield,
	IconUserCheck,
	IconUsers,
} from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { RequestStatus } from '@/features/grant_requests';
import {
	fakeActions,
	fakeEntitlements,
	fakeGrantRequests,
	fakeResources,
	fakeRoles,
	fakeRoleSuites,
} from '@/mock/fakeData';


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
	const { t: translate } = useTranslation();
	const pendingRequests = fakeGrantRequests.filter((r) => r.status === RequestStatus.PENDING);

	return (
		<Stack gap='md'>
			{pendingRequests.length > 0 && (
				<Alert variant='light' color='yellow' title={translate('nikki.authorize.overview.pending_requests')}>
					<span dangerouslySetInnerHTML={{ __html: translate('nikki.authorize.overview.pending_requests_message', { count: pendingRequests.length }) }} />
					{' '}
					<Link to='/grant-requests'>{translate('nikki.authorize.overview.view_all_requests')}</Link>
				</Alert>
			)}

			<Title order={5} mt='md'>{translate('nikki.authorize.overview.statistics')}</Title>
			<Grid>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.authorize.menu.resources')}
						value={fakeResources.length}
						icon={<IconLock size={32} />}
						color='var(--mantine-color-blue-6)'
						link='/resources'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.authorize.menu.actions')}
						value={fakeActions.length}
						icon={<IconKey size={32} />}
						color='var(--mantine-color-cyan-6)'
						link='/actions'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.authorize.menu.entitlements')}
						value={fakeEntitlements.length}
						icon={<IconShield size={32} />}
						color='var(--mantine-color-teal-6)'
						link='/entitlements'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.authorize.menu.roles')}
						value={fakeRoles.length}
						icon={<IconUserCheck size={32} />}
						color='var(--mantine-color-grape-6)'
						link='/roles'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.authorize.menu.role_suites')}
						value={fakeRoleSuites.length}
						icon={<IconUsers size={32} />}
						color='var(--mantine-color-violet-6)'
						link='/role-suites'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.authorize.menu.grant_requests')}
						value={fakeGrantRequests.length}
						icon={<IconUserCheck size={32} />}
						color='var(--mantine-color-yellow-6)'
						link='/grant-requests'
					/>
				</Grid.Col>
			</Grid>

			<Title order={5} mt='lg'>{translate('nikki.authorize.overview.recent_activity')}</Title>
			<Paper withBorder p='md'>
				<Stack gap='sm'>
					<Group justify='space-between'>
						<Group>
							<Badge color='green'>{translate('nikki.authorize.overview.grant')}</Badge>
							<Text size='sm'>
								<strong>David Pham</strong> {translate('nikki.authorize.overview.was_granted')} <strong>HR Manager</strong> {translate('nikki.authorize.overview.role')}
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>{translate('nikki.authorize.overview.hours_ago', { count: 2 })}</Text>
					</Group>
					<Group justify='space-between'>
						<Group>
							<Badge color='yellow'>{translate('nikki.authorize.overview.pending')}</Badge>
							<Text size='sm'>
								{/* <strong>Alice Nguyen</strong> requested <strong>Sales Representative</strong> for <strong>Bob Tran</strong> */}
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>{translate('nikki.authorize.overview.hours_ago', { count: 4 })}</Text>
					</Group>
					<Group justify='space-between'>
						<Group>
							<Badge color='red'>{translate('nikki.authorize.overview.revoke')}</Badge>
							<Text size='sm'>
								<strong>Henry Tran</strong> {translate('nikki.authorize.overview.had_revoked')} <strong>Sales Manager</strong> {translate('nikki.authorize.overview.role_revoked')}
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>{translate('nikki.authorize.overview.day_ago', { count: 1 })}</Text>
					</Group>
				</Stack>
			</Paper>

			<Title order={5} mt='lg'>{translate('nikki.authorize.overview.quick_links')}</Title>
			<Grid>
				<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
					<Paper withBorder p='md' component={Link} to='/resources' style={{ textDecoration: 'none', color: 'inherit' }}>
						<Text fw={500}>{translate('nikki.authorize.overview.manage_resources')}</Text>
						<Text size='sm' c='dimmed'>{translate('nikki.authorize.overview.manage_resources_desc')}</Text>
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
					<Paper withBorder p='md' component={Link} to='/roles' style={{ textDecoration: 'none', color: 'inherit' }}>
						<Text fw={500}>{translate('nikki.authorize.overview.manage_roles')}</Text>
						<Text size='sm' c='dimmed'>{translate('nikki.authorize.overview.manage_roles_desc')}</Text>
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
					<Paper withBorder p='md' component={Link} to='/grant-requests' style={{ textDecoration: 'none', color: 'inherit' }}>
						<Text fw={500}>{translate('nikki.authorize.overview.process_requests')}</Text>
						<Text size='sm' c='dimmed'>{translate('nikki.authorize.overview.process_requests_desc')}</Text>
					</Paper>
				</Grid.Col>
			</Grid>
		</Stack>
	);
}

const OverviewPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.overview.title');
	}, [translate]);
	return <OverviewPageBody />;
};

export const OverviewPage: React.FC = OverviewPageWithTitle;

