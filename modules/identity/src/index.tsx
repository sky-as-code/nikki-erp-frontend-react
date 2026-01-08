import {
	Card,
	Container,
	Grid,
	Group,
	Paper,
	Stack,
	Text,
	Title,
	ThemeIcon,
} from '@mantine/core';
import { MenuBarItem, useSetMenuBarItems } from '@nikkierp/ui/appState/layoutSlice';
import { initMicroAppStateContext, useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, MicroAppRouter,
} from '@nikkierp/ui/microApp';
import { IconBuilding, IconHierarchy, IconShield, IconUsers } from '@tabler/icons-react';
import React from 'react';
import { Navigate, useNavigate } from 'react-router';

import { selectUserState, selectGroupState, selectHierarchyState } from './appState';
import { reducer } from './appState';
import { GroupCreatePage } from './pages/group/GroupCreatePage';
import { GroupDetailPage } from './pages/group/GroupDetailPage';
import { GroupListPage } from './pages/group/GroupListPage';
import { HierarchyCreatePage } from './pages/hierarchy/HierarchyCreatePage';
import { HierarchyDetailPage } from './pages/hierarchy/HierarchyDetailPage';
import { HierarchyListPage } from './pages/hierarchy/HierarchyListPage';
import { OrganizationCreatePage } from './pages/organization/OrganizationCreatePage';
import { OrganizationDetailPage } from './pages/organization/OrganizationDetailPage';
import { OrganizationListPage } from './pages/organization/OrganizationListPage';
import { UserCreatePage } from './pages/user/UserCreatePage';
import { UserDetailPage } from './pages/user/UserDetailPage';
import { UserListPage } from './pages/user/UserListPage';


const menuBarItems: MenuBarItem[] = [
	{
		label: 'Overview',
		link: `/overview`,
	},
	{
		label: 'Users',
		items: [
			{
				label: 'Users',
				link: `/users`,
			},
			{
				label: 'Groups',
				link: `/groups`,
			},
		],
	},
	{
		label: 'Organizations',
		items: [
			{
				label: 'Organizations',
				link: `/organizations`,
			},
			{
				label: 'Hierarchy Levels',
				link: `/hierarchy-levels`,
			},
		],
	},
	{
		label: 'Settings',
		link: `/settings`,
	},
];

function Main(props: MicroAppProps) {
	const dispatch = useMicroAppDispatch();
	useSetMenuBarItems(menuBarItems, dispatch);

	return (
		<MicroAppProvider {...props}>
			<MicroAppRouter domType={props.domType} basePath={props.routing.basePath}
				widgetName={props.widgetName}
				widgetProps={props.widgetProps}
			>
				<AppRoutes>
					<AppRoute index element={<Navigate to='overview' replace />} />
					<AppRoute path='overview' element={<OverviewPage />} />
					<AppRoute path='users' element={<UserListPage />} />
					<AppRoute path='users/create' element={<UserCreatePage />} />
					<AppRoute path='users/:userId' element={<UserDetailPage />} />
					<AppRoute path='groups' element={<GroupListPage />} />
					<AppRoute path='groups/create' element={<GroupCreatePage />} />
					<AppRoute path='groups/:groupId' element={<GroupDetailPage />} />
					<AppRoute path='organizations' element={<OrganizationListPage />} />
					<AppRoute path='organizations/:slug' element={<OrganizationDetailPage />} />
					<AppRoute path='organizations/create' element={<OrganizationCreatePage />} />
					<AppRoute path='hierarchy-levels' element={<HierarchyListPage />} />
					<AppRoute path='hierarchy-levels/create' element={<HierarchyCreatePage />} />
					<AppRoute path='hierarchy-levels/:hierarchyId' element={<HierarchyDetailPage />} />
				</AppRoutes>
				{/* <WidgetRoutes>
						<WidgetRoute name='org-home' Component={OrgHomePage} />
						<WidgetRoute name='module-management' Component={ModuleManagementPage} />
					</WidgetRoutes> */}
			</MicroAppRouter>
		</MicroAppProvider>
	);
}

interface StatCardProps {
	title: string;
	value: number | string;
	icon: React.ReactNode;
	color: string;
	link: string;
}

function StatCard({ title, value, icon, color, link }: StatCardProps): React.ReactElement {
	const navigate = useNavigate();

	return (
		<Card
			shadow='sm'
			padding='lg'
			radius='md'
			withBorder
			style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
			onClick={() => navigate(link)}
			onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
			onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
		>
			<Group justify='space-between' align='flex-start'>
				<Stack gap='xs'>
					<Text size='sm' c='dimmed' fw={500}>
						{title}
					</Text>
					<Title order={2}>{value}</Title>
				</Stack>
				<ThemeIcon size='xl' radius='md' variant='light' color={color}>
					{icon}
				</ThemeIcon>
			</Group>
		</Card>
	);
}

interface QuickLinkProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	color: string;
	link: string;
}

function QuickLinkCard({ title, description, icon, color, link }: QuickLinkProps): React.ReactElement {
	const navigate = useNavigate();

	return (
		<Paper
			shadow='xs'
			p='md'
			withBorder
			style={{ cursor: 'pointer', transition: 'all 0.2s' }}
			onClick={() => navigate(link)}
			onMouseEnter={(e) => {
				e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
				e.currentTarget.style.transform = 'translateY(-2px)';
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.boxShadow = '';
				e.currentTarget.style.transform = 'translateY(0)';
			}}
		>
			<Group gap='md'>
				<ThemeIcon size='lg' radius='md' variant='light' color={color}>
					{icon}
				</ThemeIcon>
				<Stack gap={4} style={{ flex: 1 }}>
					<Text fw={600} size='sm'>
						{title}
					</Text>
					<Text size='xs' c='dimmed'>
						{description}
					</Text>
				</Stack>
			</Group>
		</Paper>
	);
}

function OverviewPage(): React.ReactNode {
	const { users } = useMicroAppSelector(selectUserState);
	const { groups } = useMicroAppSelector(selectGroupState);
	const { hierarchies } = useMicroAppSelector(selectHierarchyState);

	return (
		<Container size='xl' p='md'>
			<Stack gap='xl'>
				{/* Header */}
				<Stack gap='xs'>
					<Title order={1}>Identity & Access Management</Title>
					<Text c='dimmed' size='lg'>
						Manage users, groups, organizations, and hierarchy levels
					</Text>
				</Stack>

				{/* Statistics Cards */}
				<Grid>
					<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
						<StatCard
							title='Total Users'
							value={users.length}
							icon={<IconUsers size={24} />}
							color='blue'
							link='/users'
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
						<StatCard
							title='Groups'
							value={groups.length}
							icon={<IconShield size={24} />}
							color='green'
							link='/groups'
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
						<StatCard
							title='Hierarchy Levels'
							value={hierarchies.length}
							icon={<IconHierarchy size={24} />}
							color='violet'
							link='/hierarchy-levels'
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
						<StatCard
							title='Organizations'
							value={0}
							icon={<IconBuilding size={24} />}
							color='orange'
							link='/organizations'
						/>
					</Grid.Col>
				</Grid>

				{/* Quick Links */}
				<Stack gap='md'>
					<Title order={3}>Quick Actions</Title>
					<Grid>
						<Grid.Col span={{ base: 12, sm: 6 }}>
							<QuickLinkCard
								title='Manage Users'
								description='View, create, and manage user accounts'
								icon={<IconUsers size={20} />}
								color='blue'
								link='/users'
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6 }}>
							<QuickLinkCard
								title='Manage Groups'
								description='Configure user groups and permissions'
								icon={<IconShield size={20} />}
								color='green'
								link='/groups'
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6 }}>
							<QuickLinkCard
								title='Hierarchy Levels'
								description='Organize users by hierarchy structure'
								icon={<IconHierarchy size={20} />}
								color='violet'
								link='/hierarchy-levels'
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6 }}>
							<QuickLinkCard
								title='Organizations'
								description='Manage organizational units'
								icon={<IconBuilding size={20} />}
								color='orange'
								link='/organizations'
							/>
						</Grid.Col>
					</Grid>
				</Stack>
			</Stack>
		</Container>
	);
}

const bundle: MicroAppBundle = {
	init({ htmlTag, registerReducer }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, {
			htmlTag,
			domType,
		});

		const result = registerReducer(reducer);
		initMicroAppStateContext(result);

		return {
			domType,
		};
	},
};

export default bundle;
