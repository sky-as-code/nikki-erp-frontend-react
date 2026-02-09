import { Stack, Title } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { GroupCreateForm } from '../../features/group/components';
import { useGroupCreateHandlers } from '../../features/group/hooks/useGroupCreate';
import { useIdentityPermissions } from '../../hooks';
import groupSchema from '../../schemas/group-schema.json';


export const GroupCreatePageBody: React.FC = () => {
	const schema = groupSchema as ModelSchema;
	const { t } = useTranslation();
	const permissions = useIdentityPermissions();

	const { isLoading, onSubmit } = useGroupCreateHandlers();

	return (
		<Stack gap='md'>
			<Title order={2}>{t('nikki.identity.group.actions.createNew')}</Title>
			<GroupCreateForm
				schema={schema}
				isLoading={isLoading}
				onSubmit={onSubmit}
				canCreate={permissions.group.canCreate}
			/>
		</Stack>
	);
};

export const GroupCreatePage = withWindowTitle('Create Group', GroupCreatePageBody);
