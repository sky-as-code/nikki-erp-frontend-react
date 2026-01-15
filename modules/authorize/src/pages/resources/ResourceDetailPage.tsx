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

import {
	ListActions,
	ResourceFormFields,
	resourceSchema,
	useResourceDetail,
} from '@/features/resources';


function ResourceDetailPageBody(): React.ReactNode {
	const { resource, isLoading } = useResourceDetail.detail();
	const { isSubmitting, handleCancel, handleSubmit } = useResourceDetail.handlers(resource);
	const { t: translate } = useTranslation();
	const schema = resourceSchema as ModelSchema;

	if (isLoading) {
		return <LoadingState messageKey='nikki.authorize.resource.messages.loading' />;
	}

	if (!resource) {
		return (
			<NotFound
				onGoBack={handleCancel}
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
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data, form))} noValidate>
								<Stack gap='xs'>
									<FormActions
										isSubmitting={isSubmitting}
										onCancel={handleCancel}
										isCreate={false}
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
