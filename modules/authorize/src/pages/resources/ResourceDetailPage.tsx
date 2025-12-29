import { Stack } from '@mantine/core';
import { cleanFormData } from '@nikkierp/common/utils';
import { BreadcrumbsHeader, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import { AuthorizeDispatch, resourceActions, selectResourceState } from '@/appState';
import {
	ResourceActionsField,
	ResourceFormActions,
	ResourceFormContainer,
	ResourceFormFields,
	ResourceLoadingState,
	ResourceNotFound,
} from '@/features/resources/components/resourceForm';
import resourceSchema from '@/features/resources/resource-schema.json';
import { validateResourceForm } from '@/features/resources/validation/resourceFormValidation';

import { useUIState } from '../../../../shell/src/context/UIProviders';

import type { Resource } from '@/features/resources';


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
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleCancel = React.useCallback(() => {
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}, [navigate, location]);

	const handleSubmit = React.useCallback(async (data: unknown, form: FormType) => {
		if (!resource) return;

		const formData = cleanFormData(data as Partial<Resource>);
		setIsSubmitting(true);

		if (!validateResourceForm(formData, false, form)) {
			setIsSubmitting(false);
			return;
		}

		const newDescription = formData.description ?? null;
		const originalDescription = resource.description ?? null;

		if (newDescription === originalDescription) {
			notification.showError(
				translate('nikki.authorize.resource.errors.description_not_changed'),
				translate('nikki.general.messages.no_changes'),
			);
			setIsSubmitting(false);
			return;
		}

		if (originalDescription !== null && originalDescription !== undefined && originalDescription !== '' && newDescription === null) {
			notification.showError(
				translate('nikki.authorize.resource.errors.description_cannot_remove'),
				translate('nikki.general.messages.invalid_change'),
			);
			setIsSubmitting(false);
			return;
		}

		const result = await dispatch(resourceActions.updateResource({
			id: resource.id,
			etag: resource.etag,
			description: newDescription ?? undefined,
		}));

		if (result.meta.requestStatus === 'fulfilled') {
			notification.showInfo(
				translate('nikki.authorize.resource.messages.update_success', { name: formData.name || resource.name }),
				translate('nikki.general.messages.success'),
			);
			const parent = resolvePath('..', location.pathname).pathname;
			navigate(parent);
		}
		else {
			const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.update_failed');
			notification.showError(errorMessage, translate('nikki.general.messages.error'));
		}

		setIsSubmitting(false);
	}, [dispatch, notification, resource, navigate, location, translate]);

	return { isSubmitting, handleCancel, handleSubmit };
}

function ResourceDetailPageBody(): React.ReactNode {
	const { resource, isLoadingList } = useResourceDetailData();
	const { isSubmitting, handleCancel, handleSubmit } = useResourceDetailHandlers(resource);
	const { t: translate } = useTranslation();
	const schema = resourceSchema as ModelSchema;

	if (isLoadingList) {
		return <ResourceLoadingState />;
	}

	if (!resource) {
		return <ResourceNotFound onGoBack={handleCancel} />;
	}

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.resource.title_detail')}
				autoBuild={true}
				segmentKey='resources'
				parentTitle={translate('nikki.authorize.resource.title')}
			/>

			<ResourceFormContainer title={resource.name}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={resource}
						modelLoading={isSubmitting}
					>
						{({ handleSubmit: formHandleSubmit, form }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data, form))} noValidate>
								<Stack gap='xs'>
									<ResourceFormActions
										isSubmitting={isSubmitting}
										onCancel={handleCancel}
										isCreate={false}
									/>
									<ResourceFormFields isCreate={false} />
									<ResourceActionsField actions={resource.actions} />
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</ResourceFormContainer>
		</Stack>
	);
}

const ResourceDetailPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.resource.title_detail');
	}, [translate]);
	return <ResourceDetailPageBody />;
};

export const ResourceDetailPage: React.FC = ResourceDetailPageWithTitle;
