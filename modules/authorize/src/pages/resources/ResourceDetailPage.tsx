import { Stack } from '@mantine/core';
import {
	BreadcrumbsHeader,
	FormFieldProvider,
	FormStyleProvider,
	LoadingState,
	NotFound,
} from '@nikkierp/ui/components';
import { FormContainer, FormActions } from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import {
	ListActions,
	ResourceFormFields,
	resourceSchema,
	useResourceDetail,
	useResourceEdit,
} from '@/features/resources';
import { useAuthorizePermissions } from '@/hooks/useAuthorizePermissions';
import { handleGoBack } from '@/utils';


function ResourceDetailPageBody(): React.ReactNode {
	const { resource, isLoading } = useResourceDetail();
	const { isSubmitting, handleSubmit } = useResourceEdit(resource);
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const schema = resourceSchema as ModelSchema;
	const permissions = useAuthorizePermissions();

	if (isLoading) {
		return <LoadingState messageKey='nikki.authorize.resource.messages.loading' />;
	}

	if (!resource) {
		return (
			<NotFound
				onGoBack={() => handleGoBack(navigate, location)}
				messageKey='nikki.authorize.resource.messages.not_found'
				showBackButton={false}
			/>
		);
	}

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.resource.title_detail')}
				autoBuild={true}
				segmentKey='resources'
				parentTitle={translate('nikki.authorize.resource.title')}
			/>

			<FormContainer title={resource.name}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={resource}
						modelLoading={isSubmitting}
					>
						{({ handleSubmit: formHandleSubmit, form }) => (
							<form
								onSubmit={formHandleSubmit((data) => {
									if (!permissions.resource.canUpdate) return;
									handleSubmit(data, form);
								})}
								noValidate
							>
								<Stack gap='xs'>
									<FormActions
										isSubmitting={isSubmitting}
										onCancel={() => handleGoBack(navigate, location)}
										isCreate={false}
										showSubmit={permissions.resource.canUpdate}
									/>
									<ResourceFormFields isCreate={false} />
									<ListActions actions={resource.actions} />
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</FormContainer>
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
