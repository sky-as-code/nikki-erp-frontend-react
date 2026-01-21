import { Stack, Title } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { selectCreateOrganization } from '../../appState/organization';
import { OrganizationCreateForm } from '../../features/organization/components';
import { useOrganizationCreateHandlers } from '../../features/organization/hooks';
import organizationSchema from '../../schemas/organization-schema.json';


export const OrganizationCreatePageBody: React.FC = () => {
	const create = useMicroAppSelector(selectCreateOrganization);
	const schema = organizationSchema as ModelSchema;
	const { t } = useTranslation();
	const isLoading = create.status === 'pending';

	const { onSubmit } = useOrganizationCreateHandlers();

	return (
		<Stack gap='md'>
			<Title order={2}>{t('nikki.identity.organization.actions.createNew')}</Title>
			<OrganizationCreateForm
				schema={schema}
				isCreatingOrganization={isLoading}
				onSubmit={onSubmit}
			/>
		</Stack>
	);
};

export const OrganizationCreatePage = withWindowTitle('Create Organization', OrganizationCreatePageBody);
