import { Breadcrumbs, Group, Stack, TagsInput, Typography } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { selectUserList } from '../../appState/user';
import { ListActionListPage } from '../../components/ListActionBar';
import { UserTable } from '../../features/user/components';
import { useUserListHandlers } from '../../features/user/hooks/useUserList';
import userSchema from '../../schemas/user-schema.json';


export function UserListPageBody(): React.ReactElement {
	const listUser = useMicroAppSelector(selectUserList);
	const schema = userSchema as ModelSchema;
	const columns = ['avatar', 'email', 'displayName', 'status', 'groups', 'createdAt', 'updatedAt'];
	const { t } = useTranslation();
	const isLoading = listUser.status === 'pending';

	const { handleCreate, handleRefresh } = useUserListHandlers();


	return (
		<Stack gap='md'>
			<Group>
				<Breadcrumbs style={{ minWidth: '30%' }}>
					<Typography>
						<h4>{t('nikki.identity.user.title')}</h4>
					</Typography>
				</Breadcrumbs>
				<TagsInput
					placeholder={t('nikki.identity.user.searchPlaceholder')}
					w='500px'
				/>
			</Group>
			<ListActionListPage
				onCreate={handleCreate}
				onRefresh={handleRefresh}
			/>
			<UserTable
				columns={columns}
				users={listUser?.data}
				isLoading={isLoading}
				schema={schema}
			/>
		</Stack>
	);
}

export const UserListPage: React.FC = withWindowTitle('User List', UserListPageBody);
