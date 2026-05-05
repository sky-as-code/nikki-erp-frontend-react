// import { Stack, Title } from '@mantine/core';
// import { withWindowTitle } from '@nikkierp/ui/components';
// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import { useNavigate, useParams } from 'react-router';

// import { UserForm, UserFormVariant } from '../../features/user/UserForm';
// import { useIdentityPermissions } from '../../hooks';


// export function UserFormPageBody(): React.ReactNode {
// 	const { t } = useTranslation();
// 	const navigate = useNavigate();
// 	const params = useParams();
// 	const permissions = useIdentityPermissions();

// 	const userId = params.id;
// 	const isCreate = userId === 'create';
// 	const variant = isCreate ? 'create' : 'update';

// 	const title = isCreate
// 		? t('nikki.identity.user.actions.createNew')
// 		: t('nikki.identity.user.actions.edit');

// 	const handleCreateSuccess = React.useCallback(
// 		(newId: string) => {
// 			// `replace: true` keeps Back intuitive and drops the now-submitted
// 			// /users/create entry from history.
// 			navigate(`../${newId}`, { relative: 'path', replace: true });
// 		},
// 		[navigate],
// 	);

// 	return (
// 		<Stack gap='md'>
// 			<Title order={2}>{title}</Title>
// 			<UserForm
// 				// No `key` on purpose: the layout route keeps us mounted across
// 				// /users/create → /users/:id, and we want the React Hook Form
// 				// instance inside `CrudFormProvider` to be reused so the values
// 				// the user just typed stay visible until `getUser` returns the
// 				// freshly-persisted record and replaces them (no visual flash).
// 				variant={variant}
// 				userId={userId}
// 				canCreate={permissions.user.canCreate}
// 				canUpdate={permissions.user.canUpdate}
// 				canDelete={permissions.user.canDelete}
// 				onCreateSuccess={isCreate ? handleCreateSuccess : undefined}
// 			/>
// 		</Stack>
// 	);
// };

// export const UserFormPage = withWindowTitle('User', UserFormPageBody);
