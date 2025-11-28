import { Stack } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import { AuthorizeDispatch, resourceActions } from '../../appState';
import {
	BackButton,
	ResourceFormActions,
	ResourceFormContainer,
	ResourceFormFields,
} from '../../features/resources/components/ResourceFormFields';
import resourceSchema from '../../features/resources/resource-schema.json';
import { Resource } from '../../features/resources/types';
import { validateResourceForm } from '../../features/resources/validation/resourceFormValidation';


type FormType = Parameters<typeof validateResourceForm>[2];

function useResourceCreateHandlers() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleGoBack = React.useCallback(() => {
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}, [navigate, location]);

	const handleSubmit = React.useCallback(async (data: unknown, form: FormType) => {
		const formData = data as Partial<Resource>;
		setIsSubmitting(true);

		if (!validateResourceForm(formData, true, form)) {
			setIsSubmitting(false);
			return;
		}

		const result = await dispatch(resourceActions.createResource(
			formData as Omit<Resource, 'id' | 'createdAt' | 'etag' | 'actions' | 'actionsCount'>,
		));

		if (result.meta.requestStatus === 'fulfilled') {
			notification.showInfo(`Resource "${formData.name}" has been created successfully`, 'Success');
		}
		else {
			notification.showError(result.payload as string ?? 'Error', 'Failed to create resource');
		}

		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);

		setIsSubmitting(false);
	}, [dispatch, notification, location]);


	return { isSubmitting, handleGoBack, handleSubmit };
}

function ResourceCreatePageBody(): React.ReactNode {
	const { isSubmitting, handleGoBack, handleSubmit } = useResourceCreateHandlers();
	const schema = resourceSchema as ModelSchema;

	return (
		<Stack gap='md'>
			<BackButton onClick={handleGoBack} />
			<ResourceFormContainer title='Create New Resource'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit, form }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data, form))} noValidate>
								<Stack gap='xs'>
									<ResourceFormFields isCreate />
									<ResourceFormActions isSubmitting={isSubmitting} onCancel={handleGoBack} isCreate />
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</ResourceFormContainer>
		</Stack>
	);
}

export const ResourceCreatePage: React.FC = withWindowTitle('Create Resource', ResourceCreatePageBody);
