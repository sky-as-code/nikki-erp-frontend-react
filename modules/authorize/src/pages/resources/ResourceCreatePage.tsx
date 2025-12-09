import { Stack } from '@mantine/core';
import { cleanFormData } from '@nikkierp/common/utils';
import { BreadcrumbsHeader, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { AuthorizeDispatch, resourceActions } from '@/appState';
import {
	ResourceFormActions,
	ResourceFormContainer,
	ResourceFormFields,
} from '@/features/resources/components/ResourceForm';
import resourceSchema from '@/features/resources/resource-schema.json';
import { validateResourceForm } from '@/features/resources/validation/resourceFormValidation';

import { useUIState } from '../../../../shell/src/context/UIProviders';

import type { Resource } from '@/features/resources';


type FormType = Parameters<typeof validateResourceForm>[2];

function useResourceCreateHandlers() {
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
		const formData = cleanFormData(data as Partial<Resource>);
		setIsSubmitting(true);

		if (!validateResourceForm(formData, true, form)) {
			setIsSubmitting(false);
			return;
		}

		const result = await dispatch(resourceActions.createResource(
			formData as Omit<Resource, 'id' | 'createdAt' | 'etag' | 'actions' | 'actionsCount'>,
		));

		if (result.meta.requestStatus === 'fulfilled') {
			notification.showInfo(
				translate('nikki.authorize.resource.messages.create_success', { name: formData.name }),
				translate('nikki.general.messages.success'),
			);
		}
		else {
			const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.create_failed');
			notification.showError(errorMessage, translate('nikki.general.messages.error'));
		}

		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);

		setIsSubmitting(false);
	}, [dispatch, notification, location, translate]);


	return { isSubmitting, handleCancel, handleSubmit };
}

function ResourceCreatePageBody(): React.ReactNode {
	const {
		isSubmitting,
		handleCancel,
		handleSubmit,
	} = useResourceCreateHandlers();
	const { t: translate } = useTranslation();
	const schema = resourceSchema as ModelSchema;

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.resource.title_create')}
				autoBuild={true}
				segmentKey='resources'
				parentTitle={translate('nikki.authorize.resource.title')}
			/>

			<ResourceFormContainer>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit, form }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data, form))} noValidate>
								<Stack gap='xs'>
									<ResourceFormActions isSubmitting={isSubmitting} onCancel={handleCancel} isCreate />
									<ResourceFormFields isCreate />
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</ResourceFormContainer>
		</Stack>
	);
}

const ResourceCreatePageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.resource.title_create');
	}, [translate]);
	return <ResourceCreatePageBody />;
};

export const ResourceCreatePage: React.FC = ResourceCreatePageWithTitle;
