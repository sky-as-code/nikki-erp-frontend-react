import { Stack, Title } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { UserCreateForm } from '../../features/user/components';
import { useUserCreateHandlers } from '../../features/user/hooks/useUserCreate';
import userSchema from '../../schemas/user-schema.json';


export const UserCreatePageBody: React.FC = () => {
	const schema = userSchema as ModelSchema;
	const { t } = useTranslation();

	const { isLoading, handleCreate } = useUserCreateHandlers();

	return (
		<Stack gap='md'>
			<Title order={2}>{t('nikki.identity.user.actions.createNew')}</Title>
			<UserCreateForm
				schema={schema}
				isLoading={isLoading}
				onSubmit={handleCreate}
			/>
		</Stack>
	);
};

export const UserCreatePage = withWindowTitle('Create User', UserCreatePageBody);