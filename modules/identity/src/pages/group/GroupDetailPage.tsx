import { Breadcrumbs, Stack, Typography } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';


import { selectUserState } from '../../appState';
import { selectGroupState } from '../../appState/group';
import { ListUser } from '../../components/User';
import { GroupDetailForm } from '../../features/group/components';
import { useGroupDetailHandlers, useGroupUserManagement } from '../../features/group/hooks/useGroupDetail';
import { User } from '../../features/user/types';
import groupSchema from '../../schemas/group-schema.json';


export const GroupDetailPageBody: React.FC = () => {
	const { groupId } = useParams();
	const { groupDetail, isLoading } = useMicroAppSelector(selectGroupState);
	const { users } = useMicroAppSelector(selectUserState);
	const schema = groupSchema as ModelSchema;
	const { t } = useTranslation();

	const { handleUpdate, handleDelete } = useGroupDetailHandlers(groupId!);
	const { handleAddUsers, handleRemoveUsers } = useGroupUserManagement(groupId!);

	const usersByGroup = React.useMemo(() => {
		if (!groupId || !users.length) return [];
		return users.filter((user: User) =>
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
				{groupDetail?.name && (
					<Typography>
						<h5>{groupDetail.name}</h5>
					</Typography>
				)}
			</Breadcrumbs>
			<GroupDetailForm
				schema={schema}
				groupDetail={groupDetail}
				isLoading={isLoading}
				onSubmit={handleUpdate}
				onDelete={handleDelete}
			/>
			<ListUser
				users={usersByGroup}
				availableUsers={users}
				isLoading={isLoading}
				onAddUsers={handleAddUsers}
				onRemoveUsers={handleRemoveUsers}
			/>
		</Stack>
	);
};

export const GroupDetailPage: React.FC = withWindowTitle('Group Detail', GroupDetailPageBody);
