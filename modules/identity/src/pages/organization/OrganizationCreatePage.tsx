import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import { IdentityDispatch, organizationActions, selectOrganizationState } from '../../appState';
import { HeaderCreatePage } from '../../components/HeaderCreatePage/HeaderCreatePage';
import { OrganizationCreateForm } from '../../features/organization/components';
import organizationSchema from '../../schemas/organization-schema.json';


function useOrganizationCreateHandlers() {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();

	const handleCreate = React.useCallback((data: any) => {
		dispatch(organizationActions.createOrganization(data))
			.unwrap()
			.then(() => {
				notification.showInfo(t('nikki.identity.organization.messages.createSuccess'), '');
				navigate('..', { relative: 'path' });
			})
			.catch(() => {
				notification.showError(t('nikki.identity.organization.messages.createError'), '');
			});
	}, [dispatch, navigate, notification]);

	return {
		handleCreate,
	};
}

export const OrganizationCreatePageBody: React.FC = () => {
	const { isCreatingOrganization } = useMicroAppSelector(selectOrganizationState);
	const schema = organizationSchema as ModelSchema;

	const { handleCreate } = useOrganizationCreateHandlers();

	return (
		<Stack gap='md'>
			<HeaderCreatePage title='nikki.identity.organization.actions.create' />
			<OrganizationCreateForm
				schema={schema}
				isCreatingOrganization={isCreatingOrganization}
				onSubmit={handleCreate}
			/>
		</Stack>
	);
};

export const OrganizationCreatePage = withWindowTitle('Create Organization', OrganizationCreatePageBody);
