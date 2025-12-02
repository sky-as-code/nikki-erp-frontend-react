import { Stack } from '@mantine/core';
import { cleanFormData } from '@nikkierp/common/utils';
import { FormFieldProvider, FormStyleProvider, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import { AuthorizeDispatch, roleActions } from '../../appState';
import { BackButton } from '../../features/roles/components/Button';
import {
	RoleFormActions,
	RoleFormContainer,
	RoleFormFields,
} from '../../features/roles/components/RoleForm';
import roleSchema from '../../features/roles/role-schema.json';
import { Role } from '../../features/roles/types';


function useRoleCreateHandlers() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleGoBack = React.useCallback(() => {
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}, [navigate, location]);

	const handleSubmit = React.useCallback(async (data: unknown) => {
		const formData = cleanFormData(data as Partial<Role>);
		setIsSubmitting(true);

		const result = await dispatch(roleActions.createRole(
			formData as Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'etag' | 'entitlementsCount' | 'assignmentsCount' | 'suitesCount' | 'ownerName'>,
		));

		if (result.meta.requestStatus === 'fulfilled') {
			notification.showInfo(
				translate('nikki.authorize.role.messages.create_success', { name: formData.name }),
				translate('nikki.general.messages.success'),
			);
			const parent = resolvePath('..', location.pathname).pathname;
			navigate(parent);
		}
		else {
			const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.create_failed');
			notification.showError(errorMessage, translate('nikki.general.messages.error'));
		}

		setIsSubmitting(false);
	}, [dispatch, notification, location, translate, navigate]);

	return { isSubmitting, handleGoBack, handleSubmit };
}

function RoleCreatePageBody(): React.ReactNode {
	const {
		isSubmitting,
		handleGoBack,
		handleSubmit,
	} = useRoleCreateHandlers();
	const { t: translate } = useTranslation();
	const schema = roleSchema as ModelSchema;

	return (
		<Stack gap='md'>
			<BackButton onClick={handleGoBack} />
			<RoleFormContainer title={translate('nikki.authorize.role.title_create')}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='xs'>
									<RoleFormFields isCreate />
									<RoleFormActions isSubmitting={isSubmitting} onCancel={handleGoBack} isCreate />
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</RoleFormContainer>
		</Stack>
	);
}

export const RoleCreatePage: React.FC = withWindowTitle('Create Role', RoleCreatePageBody);

