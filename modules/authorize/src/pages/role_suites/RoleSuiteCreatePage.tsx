import { Stack } from '@mantine/core';
import { cleanFormData } from '@nikkierp/common/utils';
import { BreadcrumbsHeader, FormFieldProvider, FormStyleProvider, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { AuthorizeDispatch, roleSuiteActions } from '@/appState';
import {
	RoleSuiteFormActions,
	RoleSuiteFormContainer,
	RoleSuiteFormFields,
} from '@/features/roleSuite/components/RoleSuiteForm';
import roleSuiteSchema from '@/features/roleSuite/roleSuite-schema.json';

import { useUIState } from '../../../../shell/src/context/UIProviders';

import type { RoleSuite } from '@/features/roleSuite';


function useRoleSuiteCreateHandlers() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleCancel = React.useCallback(() => {
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}, [navigate, location]);

	const handleSubmit = React.useCallback(async (data: unknown) => {
		const formData = cleanFormData(data as Partial<RoleSuite>);
		setIsSubmitting(true);

		const result = await dispatch(roleSuiteActions.createRoleSuite(
			formData as Omit<RoleSuite, 'id' | 'createdAt' | 'updatedAt' | 'etag' | 'rolesCount' | 'ownerName'>,
		));

		if (result.meta.requestStatus === 'fulfilled') {
			notification.showInfo(
				translate('nikki.authorize.role_suite.messages.create_success', { name: formData.name }),
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

	return { isSubmitting, handleCancel, handleSubmit };
}

function RoleSuiteCreatePageBody(): React.ReactNode {
	const {
		isSubmitting,
		handleGoBack,
		handleSubmit,
	} = useRoleSuiteCreateHandlers();
	const { t: translate } = useTranslation();
	const schema = roleSuiteSchema as ModelSchema;

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.role_suite.title_create')}
				autoBuild={true}
				segmentKey='role-suites'
				parentTitle={translate('nikki.authorize.role_suite.title')}
			/>

			<RoleSuiteFormContainer>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='xs'>
									<RoleSuiteFormActions
										isSubmitting={isSubmitting}
										onCancel={handleCancel}
										isCreate
									/>
									<RoleSuiteFormFields isCreate />
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</RoleSuiteFormContainer>
		</Stack>
	);
}

export const RoleSuiteCreatePage: React.FC = withWindowTitle('Create Role Suite', RoleSuiteCreatePageBody);

