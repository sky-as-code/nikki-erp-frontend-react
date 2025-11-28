import { Stack } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { resolvePath, useLocation, useNavigate, useParams, useResolvedPath } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import { AuthorizeDispatch, resourceActions, selectResourceState } from '../../appState';
import {
	BackButton,
	ResourceActionsField,
	ResourceFormActions,
	ResourceFormContainer,
	ResourceFormFields,
	ResourceLoadingState,
	ResourceNotFound,
} from '../../features/resources/components/ResourceFormFields';
import resourceSchema from '../../features/resources/resource-schema.json';
import { Resource } from '../../features/resources/types';
import { validateResourceForm } from '../../features/resources/validation/resourceFormValidation';


type FormType = Parameters<typeof validateResourceForm>[2];

function useResourceDetailData() {
	const { resourceName } = useParams<{ resourceName: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { resources, isLoadingList } = useMicroAppSelector(selectResourceState);

	const resource = React.useMemo(() => {
		if (!resourceName) return undefined;
		return resources.find((r: Resource) => r.name === resourceName);
	}, [resourceName, resources]);

	React.useEffect(() => {
		if (resources.length === 0) {
			dispatch(resourceActions.listResources());
		}
	}, [dispatch, resources.length]);

	return { resource, isLoadingList };
}

function useResourceDetailHandlers(resource: Resource | undefined) {
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
		if (!resource) return;

		const formData = data as Partial<Resource>;
		setIsSubmitting(true);

		try {
			if (!validateResourceForm(formData, false, form)) {
				setIsSubmitting(false);
				return;
			}

			await dispatch(resourceActions.updateResource({
				id: resource.id,
				resource: {
					name: formData.name,
					description: formData.description,
					resourceType: formData.resourceType,
					resourceRef: formData.resourceRef,
					scopeType: formData.scopeType,
				},
				etag: resource.etag,
			})).unwrap();

			notification.showInfo(`Resource "${formData.name || resource.name}" has been updated`, 'Success');
		}
		catch {
			notification.showError('Something went wrong. Please try again later.', 'Failed to update resource');
		}
		finally {
			setIsSubmitting(false);
		}
	}, [dispatch, notification, resource]);

	return { isSubmitting, handleGoBack, handleSubmit };
}

function ResourceDetailPageBody(): React.ReactNode {
	const { resource, isLoadingList } = useResourceDetailData();
	const { isSubmitting, handleGoBack, handleSubmit } = useResourceDetailHandlers(resource);
	const schema = resourceSchema as ModelSchema;

	if (isLoadingList) {
		return <ResourceLoadingState />;
	}

	if (!resource) {
		return <ResourceNotFound onGoBack={handleGoBack} />;
	}

	return (
		<Stack gap='md'>
			<BackButton onClick={handleGoBack} />
			<ResourceFormContainer title={resource.name}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={resource as unknown as Record<string, unknown>}
						modelLoading={isSubmitting}
					>
						{({ handleSubmit: formHandleSubmit, form }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data, form))} noValidate>
								<Stack gap='md'>
									<ResourceFormFields isCreate={false} />
									<ResourceActionsField actions={resource.actions} />
									<ResourceFormActions
										isSubmitting={isSubmitting}
										onCancel={handleGoBack}
										isCreate={false}
									/>
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</ResourceFormContainer>
		</Stack>
	);
}

export const ResourceDetailPage: React.FC = withWindowTitle('Resource Details', ResourceDetailPageBody);
