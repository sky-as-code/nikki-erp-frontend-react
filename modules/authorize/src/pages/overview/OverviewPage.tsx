import { Alert, Grid, Stack, Title } from '@mantine/core';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
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

import {
	AuthorizeDispatch,
	actionActions,
	entitlementActions,
	grantRequestActions,
	resourceActions,
	roleActions,
	roleSuiteActions,
	selectActionList,
	selectEntitlementList,
	selectGrantRequestList,
	selectResourceList,
	selectRoleList,
	selectRoleSuiteList,
} from '@/appState';
import { GrantRequest, RequestStatus } from '@/features/grantRequests';
import { QuickLinks, StatCard } from '@/features/overviews';


// eslint-disable-next-line max-lines-per-function
function OverviewPageBody(): React.ReactNode {
	const { t: translate } = useTranslation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();

	const resources = useMicroAppSelector(selectResourceList);
	const actions = useMicroAppSelector(selectActionList);
	const entitlements = useMicroAppSelector(selectEntitlementList);
	const roles = useMicroAppSelector(selectRoleList);
	const roleSuites = useMicroAppSelector(selectRoleSuiteList);
	const grantRequests = useMicroAppSelector(selectGrantRequestList);

	const pendingRequests = grantRequests.filter((r: GrantRequest) => r.status === RequestStatus.PENDING);

	React.useEffect(() => {
		dispatch(resourceActions.listResources());
		dispatch(actionActions.listActions(undefined));
		dispatch(entitlementActions.listEntitlements());
		dispatch(roleActions.listRoles(undefined));
		dispatch(roleSuiteActions.listRoleSuites(undefined));
		dispatch(grantRequestActions.listGrantRequests());
	}, [dispatch]);

	return (
		<Stack gap='md'>
			{pendingRequests.length > 0 && (
				<Alert variant='light' color='yellow' title={translate('nikki.authorize.overview.pending_requests')}>
					<span dangerouslySetInnerHTML={{ __html: translate('nikki.authorize.overview.pending_requests_message', { count: pendingRequests.length }) }} />
					{' '}
					<Link to='../grant-requests'>{translate('nikki.authorize.overview.view_all_requests')}</Link>
				</Alert>
			)}

			<Title order={5} mt='md'>{translate('nikki.authorize.overview.statistics')}</Title>
			<Grid>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.authorize.menu.resources')}
						value={resources.data?.length ?? 0}
						icon={<IconLock size={32} />}
						color='var(--mantine-color-blue-6)'
						link='../resources'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.authorize.menu.actions')}
						value={actions.length}
						icon={<IconKey size={32} />}
						color='var(--mantine-color-cyan-6)'
						link='../actions'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.authorize.menu.entitlements')}
						value={entitlements.length}
						icon={<IconShield size={32} />}
						color='var(--mantine-color-teal-6)'
						link='../entitlements'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.authorize.menu.roles')}
						value={roles.length}
						icon={<IconUserCheck size={32} />}
						color='var(--mantine-color-grape-6)'
						link='../roles'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.authorize.menu.role_suites')}
						value={roleSuites.length}
						icon={<IconUsers size={32} />}
						color='var(--mantine-color-violet-6)'
						link='../role-suites'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.authorize.menu.grant_requests')}
						value={grantRequests.length}
						icon={<IconUserCheck size={32} />}
						color='var(--mantine-color-yellow-6)'
						link='../grant-requests'
					/>
				</Grid.Col>
			</Grid>

			<QuickLinks
				links={[
					{
						titleKey: 'nikki.authorize.overview.manage_resources',
						descriptionKey: 'nikki.authorize.overview.manage_resources_desc',
						link: '../resources',
					},
					{
						titleKey: 'nikki.authorize.overview.manage_roles',
						descriptionKey: 'nikki.authorize.overview.manage_roles_desc',
						link: '../roles',
					},
					{
						titleKey: 'nikki.authorize.overview.process_requests',
						descriptionKey: 'nikki.authorize.overview.process_requests_desc',
						link: '../grant-requests',
					},
				]}
			/>
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

