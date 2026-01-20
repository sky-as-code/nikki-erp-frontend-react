import { Stack, Title } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { selectUserState } from '../../appState/user';
import { UserCreateForm } from '../../features/user/components';
import { useUserCreateHandlers } from '../../features/user/hooks/useUserCreate';
import userSchema from '../../schemas/user-schema.json';


export const UserCreatePageBody: React.FC = () => {
	const { isLoading } = useMicroAppSelector(selectUserState);
	const schema = userSchema as ModelSchema;
	const { t } = useTranslation();

	const { handleCreate } = useUserCreateHandlers();

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