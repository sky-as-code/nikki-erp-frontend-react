import { Breadcrumbs, Stack, Typography } from '@mantine/core';
import { NotFound, withWindowTitle, LoadingState } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';


import { selectGroupDetail } from '../../appState/group';
import { selectSearchUsers } from '../../appState/user';
import { ListUser } from '../../components/User';
import { GroupForm } from '../../features/group/components';
import { useGroupUserManagement } from '../../features/group/hooks/useGroupDetail';
import { User } from '../../features/user/types';
import { useIdentityPermissions } from '../../hooks';


export const GroupDetailPageBody: React.FC = () => {
	const { groupId } = useParams();
	const groupDetail = useMicroAppSelector(selectGroupDetail);
	const users = useMicroAppSelector(selectSearchUsers);
	const { t } = useTranslation();
	const permissions = useIdentityPermissions();
	const navigate = useNavigate();
	const isLoadingDetail = groupDetail?.status;
	const { isLoadingManageUsers,
		handleAddUsers,
		handleRemoveUsers } = useGroupUserManagement();

	const usersByGroup = React.useMemo(() => {
		if (!groupId || !users.data.length) return [];
		return users.data.filter((user: User) =>
			user.groups?.some(group => group.id === groupId),
		);
	}, [users, groupId]);

	const handleGoBack = () => {
		navigate('..', { relative: 'path' });
	};

	if (isLoadingDetail === 'error' || isLoadingDetail === 'idle') {
		return (
			<NotFound
				onGoBack={handleGoBack}
				messageKey='nikki.identity.group.messages.notFoundMessage'
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
						<h4>{t('nikki.identity.group.title')}</h4>
					</Link>
				</Typography>
			</Breadcrumbs>
			<GroupForm
				variant='update'
				groupId={groupId}
				canUpdate={permissions.group.canUpdate}
				canDelete={permissions.group.canDelete}
			/>
			<ListUser
				users={usersByGroup}
				availableUsers={users?.data}
				isLoading={isLoadingManageUsers}
				onAddUsers={handleAddUsers}
				onRemoveUsers={handleRemoveUsers}
				canManage={permissions.group.canUpdate}
			/>
		</Stack>
	);
};

export const GroupDetailPage: React.FC = withWindowTitle('Group Detail', GroupDetailPageBody);
