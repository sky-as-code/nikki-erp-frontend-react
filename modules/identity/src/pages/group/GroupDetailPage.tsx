import { Breadcrumbs, Stack, Typography } from '@mantine/core';
import { NotFound, withWindowTitle, LoadingState } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { data, Link, useNavigate, useParams } from 'react-router';


import { selectGroupDetail } from '../../appState/group';
import { selectUserList } from '../../appState/user';
import { ListUser } from '../../components/User';
import { GroupDetailForm } from '../../features/group/components';
import { useGroupDetailHandlers, useGroupUserManagement } from '../../features/group/hooks/useGroupDetail';
import { User } from '../../features/user/types';
import { useIdentityPermissions } from '../../hooks';
import groupSchema from '../../schemas/group-schema.json';


export const GroupDetailPageBody: React.FC = () => {
	const { groupId } = useParams();
	const groupDetail = useMicroAppSelector(selectGroupDetail);
	const users = useMicroAppSelector(selectUserList);
	const schema = groupSchema as ModelSchema;
	const { t } = useTranslation();
	const permissions = useIdentityPermissions();
	const navigate = useNavigate();
	const { isLoadingDetail, handleUpdate, handleDelete } = useGroupDetailHandlers();
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
			<GroupDetailForm
				schema={schema}
				groupDetail={groupDetail?.data}
				onSubmit={handleUpdate}
				onDelete={handleDelete}
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
