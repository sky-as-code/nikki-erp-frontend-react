import { Breadcrumbs, Stack, Typography } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';

import { selectUserState } from '../../appState/user';
import { UserDetailForm } from '../../features/user/components';
import { useUserDetailHandlers } from '../../features/user/hooks/useUserDetail';
import userSchema from '../../schemas/user-schema.json';


export const UserDetailPageBody: React.FC = () => {
	const { userId } = useParams();
	const { userDetail, isLoading } = useMicroAppSelector(selectUserState);
	const schema = userSchema as ModelSchema;
	const { t } = useTranslation();

	const handlers = useUserDetailHandlers(userId!, userDetail?.etag);

	return (
		<Stack gap='md'>
			<Breadcrumbs>
				<Typography>
					<Link to='..'>
						<h4>{t('nikki.identity.user.title')}</h4>
					</Link>
				</Typography>
				{userDetail?.email && (
					<Typography>
						<h5>{userDetail.email}</h5>
					</Typography>
				)}
			</Breadcrumbs>
			<UserDetailForm
				schema={schema}
				userDetail={userDetail}
				isLoading={isLoading}
				onSubmit={handlers.handleUpdate}
				onDelete={handlers.handleDelete}
			/>
		</Stack>
	);
};

export const UserDetailPage: React.FC = withWindowTitle('User Detail', UserDetailPageBody);
