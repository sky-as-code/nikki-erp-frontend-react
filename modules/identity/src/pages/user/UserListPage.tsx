import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { selectSearchUsers } from '../../appState/user';
import { ListPageLayout } from '../../components/ListPageLayout';
import { UserTable } from '../../features/user/components';
import { useUserListHandlers } from '../../features/user/hooks/useUserList';
import { useIdentityPermissions } from '../../hooks';


export function UserListPageBody(): React.ReactElement {
	const listUser = useMicroAppSelector(selectSearchUsers);
	const { t } = useTranslation();
	const isLoading = listUser?.status === 'pending';
	const permissions = useIdentityPermissions();

	const { handleCreate, handleRefresh } = useUserListHandlers();

	return (
		<ListPageLayout
			title={t('nikki.identity.user.title')}
			searchPlaceholder={t('nikki.identity.user.searchPlaceholder')}
			onCreate={permissions.user.canCreate ? handleCreate : undefined}
			onRefresh={handleRefresh}
		>
			{() => (
				<UserTable
					users={listUser?.data?.items ?? []}
					isLoading={isLoading}
				/>
			)}
		</ListPageLayout>
	);
}

export const UserListPage: React.FC = withWindowTitle('User List', UserListPageBody);
