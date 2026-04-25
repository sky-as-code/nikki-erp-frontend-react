import { Stack, Title } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { userActions } from '../../appState/user';
// import { UserCreateForm } from '../../features/user/components';
// import { useUserCreateHandlers } from '../../features/user/hooks/useUserCreate';
import { useIdentityPermissions } from '../../hooks';


// export const UserCreatePageBody: React.FC = () => {
// 	const { t } = useTranslation();
// 	const permissions = useIdentityPermissions();

// 	// const { isLoading, handleCreate } = useUserCreateHandlers();

// 	return (
// 		<Stack gap='md'>
// 			<Title order={2}>{t('nikki.identity.user.actions.createNew')}</Title>
// 			<UserCreateForm
// 				// isLoading={isLoading}
// 				// onSubmit={handleCreate}
// 				canCreate={permissions.user.canCreate}
// 				submitAction={userActions.createUser}
// 			/>
// 		</Stack>
// 	);
// };

// export const UserCreatePage = withWindowTitle('Create User', UserCreatePageBody);