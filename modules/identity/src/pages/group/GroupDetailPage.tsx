import { Breadcrumbs, Stack, Typography } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { data, Link, useParams } from 'react-router';


import { selectGroupDetail } from '../../appState/group';
import { selectUserList } from '../../appState/user';
import { ListUser } from '../../components/User';
import { GroupDetailForm } from '../../features/group/components';
import { useGroupDetailHandlers, useGroupUserManagement } from '../../features/group/hooks/useGroupDetail';
import { User } from '../../features/user/types';
import groupSchema from '../../schemas/group-schema.json';


export const GroupDetailPageBody: React.FC = () => {
	const { groupId } = useParams();
	const groupDetail = useMicroAppSelector(selectGroupDetail);
	const users = useMicroAppSelector(selectUserList);
	const schema = groupSchema as ModelSchema;
	const { t } = useTranslation();

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
				isLoading={isLoadingDetail}
				onSubmit={handleUpdate}
				onDelete={handleDelete}
			/>
			<ListUser
				users={usersByGroup}
				availableUsers={users?.data}
				isLoading={isLoadingManageUsers}
				onAddUsers={handleAddUsers}
				onRemoveUsers={handleRemoveUsers}
			/>
		</Stack>
	);
};

export const GroupDetailPage: React.FC = withWindowTitle('Group Detail', GroupDetailPageBody);
