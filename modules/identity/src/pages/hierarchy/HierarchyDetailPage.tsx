import { Breadcrumbs, Stack, Typography } from '@mantine/core';
import { NotFound, withWindowTitle, LoadingState } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';

import { selectHierarchyDetail } from '../../appState/hierarchy';
import { selectSearchUsers } from '../../appState/user';
import { ListUser } from '../../components/User';
import { OrgUnitForm } from '../../features/hierarchy/components';
import { useHierarchyUserManagement } from '../../features/hierarchy/hooks';
import { useIdentityPermissions } from '../../hooks';


export const HierarchyDetailPageBody: React.FC = () => {
	const { hierarchyId } = useParams();
	const hierarchyDetail = useMicroAppSelector(selectHierarchyDetail);
	const users = useMicroAppSelector(selectSearchUsers);
	const { t } = useTranslation();
	const permissions = useIdentityPermissions();
	const navigate = useNavigate();
	const isLoadingDetail = hierarchyDetail?.status;
	const { isLoadingManageUsers,
		handleAddUsers,
		handleRemoveUsers } = useHierarchyUserManagement();

	const usersByHierarchy = React.useMemo(() => {
		if (!hierarchyId || !users.data.length) return [];
		return users.data.filter((user: any) =>
			user.orgUnit?.id === hierarchyId,
		);
	}, [users, hierarchyId]);

	const handleGoBack = () => {
		navigate('..', { relative: 'path' });
	};

	if (isLoadingDetail === 'error' || isLoadingDetail === 'idle') {
		return (
			<NotFound
				onGoBack={handleGoBack}
				messageKey='nikki.identity.hierarchy.messages.notFoundMessage'
			/>
		);
	}

	if (isLoadingDetail != 'success') {
		return <LoadingState messageKey='nikki.authorize.entitlement.messages.loading' />;
	}

	return (
		<Stack gap='md'>
			<Breadcrumbs>
				<Typography>
					<Link to='..'>
						<h4>{t('nikki.identity.hierarchy.title')}</h4>
					</Link>
				</Typography>
			</Breadcrumbs>
			<OrgUnitForm
				variant='update'
				orgUnitId={hierarchyId}
				canUpdate={permissions.orgUnit.canUpdate}
				canDelete={permissions.orgUnit.canDelete}
			/>
			<ListUser
				users={usersByHierarchy}
				availableUsers={users?.data}
				isLoading={isLoadingManageUsers}
				onAddUsers={handleAddUsers}
				onRemoveUsers={handleRemoveUsers}
				title={t('nikki.identity.hierarchy.title')}
				emptyMessage={t('nikki.identity.hierarchy.messages.noHierarchies')}
				canManage={permissions.orgUnit.canUpdate}
			/>
		</Stack>
	);
};

export const HierarchyDetailPage: React.FC = withWindowTitle('Hierarchy Detail', HierarchyDetailPageBody);
