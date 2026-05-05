// import { withWindowTitle } from '@nikkierp/ui/components';
// import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import { useNavigate } from 'react-router';

// import { ListPageLayout } from '../../components/ListPageLayout';
// import { UserDispatch, useSearchUsers } from '../../features/user';
// import { UserTable } from '../../features/user/UserTable';
// // import { useIdentityPermissions } from '../../hooks';


// export function UserListPageBody(): React.ReactElement {
// 	const searchUsers = useSearchUsers();
// 	const { t } = useTranslation();
// 	// const permissions = useIdentityPermissions();
// 	const { handleCreate, handleRefresh } = useUserListHandlers();

// 	return (
// 		<ListPageLayout
// 			title={t('nikki.identity.user.title')}
// 			searchPlaceholder={t('nikki.identity.user.searchPlaceholder')}
// 			onCreate={handleCreate}
// 			onRefresh={handleRefresh}
// 		>
// 			{() => (
// 				<UserTable
// 					users={searchUsers?.data?.items ?? []}
// 					isLoading={searchUsers.isLoading}
// 				/>
// 			)}
// 		</ListPageLayout>
// 	);
// }

// export const UserListPage: React.FC = withWindowTitle('User List', UserListPageBody);


// function useUserListHandlers() {
// 	const searchUsers = useSearchUsers();
// 	const navigate = useNavigate();
// 	const dispatch: UserDispatch = useMicroAppDispatch();

// 	const handleCreate = () => {
// 		navigate('create');
// 	};

// 	const handleRefresh = () => {
// 		dispatch(searchUsers.action({}));
// 	};

// 	React.useEffect(() => {
// 		handleRefresh();
// 	}, [dispatch]);

// 	return {
// 		handleCreate,
// 		handleRefresh,
// 	};
// }