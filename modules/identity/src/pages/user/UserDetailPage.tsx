// import { Breadcrumbs, Stack, Typography } from '@mantine/core';
// import { NotFound, withWindowTitle, LoadingState } from '@nikkierp/ui/components';
// import { useMicroAppSelector } from '@nikkierp/ui/microApp';
// import { ModelSchema } from '@nikkierp/ui/model';
// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import { Link, useNavigate } from 'react-router';

// // import { selectUserDetail } from '../../appState/user';
// import { UserDetailForm } from '../../features/user/components';
// import { useUserDetailHandlers } from '../../features/user/hooks/useUserDetail';
// import { useIdentityPermissions } from '../../hooks';
// import userSchema from '../../schemas/user-schema.json';


// export const UserDetailPageBody: React.FC = () => {
// 	const userDetail: any = null; //useMicroAppSelector(selectUserDetail);
// 	const schema = userSchema as ModelSchema;
// 	const { t } = useTranslation();
// 	const permissions = useIdentityPermissions();
// 	const navigate = useNavigate();

// 	const {isLoadingDetail, handleUpdate, handleDelete } = useUserDetailHandlers();
// 	const handleGoBack = () => {
// 		navigate('..', { relative: 'path' });
// 	};

// 	if (isLoadingDetail === 'error' || isLoadingDetail === 'idle') {
// 		return (
// 			<NotFound
// 				onGoBack={handleGoBack}
// 				messageKey='nikki.identity.user.messages.notFoundMessage'
// 			/>
// 		);
// 	}

// 	if (isLoadingDetail != 'success') {
// 		return <LoadingState messageKey='nikki.authorize.entitlement.messages.loading' />;
// 	}

// 	return (
// 		<Stack gap='md'>
// 			<Breadcrumbs>
// 				<Typography>
// 					<Link to='..'>
// 						<h4>{t('nikki.identity.user.title')}</h4>
// 					</Link>
// 				</Typography>
// 			</Breadcrumbs>
// 			<UserDetailForm
// 				schema={schema}
// 				userDetail={userDetail?.data}
// 				onSubmit={handleUpdate}
// 				onDelete={handleDelete}
// 				canUpdate={permissions.user.canUpdate}
// 				canDelete={permissions.user.canDelete}
// 			/>
// 		</Stack>
// 	);
// };

// export const UserDetailPage: React.FC = withWindowTitle('User Detail', UserDetailPageBody);
