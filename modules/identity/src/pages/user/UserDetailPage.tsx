import { Breadcrumbs, Stack, Typography } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { selectUserDetail } from '../../appState/user';
import { UserDetailForm } from '../../features/user/components';
import { useUserDetailHandlers } from '../../features/user/hooks/useUserDetail';
import userSchema from '../../schemas/user-schema.json';


export const UserDetailPageBody: React.FC = () => {
	const userDetail = useMicroAppSelector(selectUserDetail);
	const schema = userSchema as ModelSchema;
	const { t } = useTranslation();

	const {isLoadingDetail, handleUpdate, handleDelete } = useUserDetailHandlers();

	return (
		<Stack gap='md'>
			<Breadcrumbs>
				<Typography>
					<Link to='..'>
						<h4>{t('nikki.identity.user.title')}</h4>
					</Link>
				</Typography>
			</Breadcrumbs>
			<UserDetailForm
				schema={schema}
				userDetail={userDetail?.data}
				isLoading={isLoadingDetail}
				onSubmit={handleUpdate}
				onDelete={handleDelete}
			/>
		</Stack>
	);
};

export const UserDetailPage: React.FC = withWindowTitle('User Detail', UserDetailPageBody);
