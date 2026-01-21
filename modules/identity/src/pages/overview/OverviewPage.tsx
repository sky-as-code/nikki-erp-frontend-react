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
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { IconBuilding, IconHierarchy, IconShield, IconUsers } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useActiveOrgWithDetails } from '../../../../../libs/shell/src/userContext/userContextSelectors';
import { organizationActions, IdentityDispatch, userActions, groupActions, hierarchyActions } from '../../appState';
import { selectGroupList } from '../../appState/group';
import { selectHierarchyList } from '../../appState/hierarchy';
import { selectOrganizationList } from '../../appState/organization';
import { selectUserList } from '../../appState/user';


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

// eslint-disable-next-line max-lines-per-function
export const OverviewPageBody: React.FC = () => {
	const users  = useMicroAppSelector(selectUserList);
	const groups = useMicroAppSelector(selectGroupList);
	const hierarchies = useMicroAppSelector(selectHierarchyList);
	const organizations = useMicroAppSelector(selectOrganizationList);
	const { t } = useTranslation();
	const activeOrg = useActiveOrgWithDetails();
	const dispatch: IdentityDispatch = useMicroAppDispatch();

	React.useEffect(() => {
		dispatch(organizationActions.listOrganizations());
		dispatch(userActions.listUsers(activeOrg!.id));
		dispatch(groupActions.listGroups(activeOrg!.id));
		dispatch(hierarchyActions.listHierarchies(activeOrg!.id));
	}, [dispatch, activeOrg?.id]);

	return (
		<Container size='xl' p='md'>
			<Stack gap='xl'>
				{/* Header */}
				<Stack gap='xs'>
					<Title order={1}>{t('nikki.identity.overview.title')}</Title>
					<Text c='dimmed' size='lg'>
						{t('nikki.identity.overview.description')}
					</Text>
				</Stack>

				{/* Statistics Cards */}
				<Grid>
					<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
						<StatCard
							title={t('nikki.identity.overview.stats.users')}
							value={users?.data.length}
							icon={<IconUsers size={24} />}
							color='blue'
							link='../users'
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
						<StatCard
							title={t('nikki.identity.overview.stats.groups')}
							value={groups?.data.length}
							icon={<IconShield size={24} />}
							color='green'
							link='../groups'
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
						<StatCard
							title={t('nikki.identity.overview.stats.hierarchyLevels')}
							value={hierarchies?.data.length}
							icon={<IconHierarchy size={24} />}
							color='violet'
							link='../hierarchy-levels'
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
						<StatCard
							title={t('nikki.identity.overview.stats.organizations')}
							value={organizations?.data.length}
							icon={<IconBuilding size={24} />}
							color='orange'
							link='../organizations'
						/>
					</Grid.Col>
				</Grid>

				{/* Quick Links */}
				<Stack gap='md'>
					<Title order={3}>{t('nikki.identity.overview.quickLinks.title')}</Title>
					<Grid>
						<Grid.Col span={{ base: 12, sm: 6 }}>
							<QuickLinkCard
								title={t('nikki.identity.overview.quickLinks.manageUsers.title')}
								description={t('nikki.identity.overview.quickLinks.manageUsers.description')}
								icon={<IconUsers size={20} />}
								color='blue'
								link='../users'
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6 }}>
							<QuickLinkCard
								title={t('nikki.identity.overview.quickLinks.manageGroups.title')}
								description={t('nikki.identity.overview.quickLinks.manageGroups.description')}
								icon={<IconShield size={20} />}
								color='green'
								link='../groups'
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6 }}>
							<QuickLinkCard
								title={t('nikki.identity.overview.quickLinks.hierarchyLevels.title')}
								description={t('nikki.identity.overview.quickLinks.hierarchyLevels.description')}
								icon={<IconHierarchy size={20} />}
								color='violet'
								link='../hierarchy-levels'
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6 }}>
							<QuickLinkCard
								title={t('nikki.identity.overview.quickLinks.organizations.title')}
								description={t('nikki.identity.overview.quickLinks.organizations.description')}
								icon={<IconBuilding size={20} />}
								color='orange'
								link='../organizations'
							/>
						</Grid.Col>
					</Grid>
				</Stack>
			</Stack>
		</Container>
	);
};

export const OverviewPage: React.FC = withWindowTitle('Overview', OverviewPageBody);