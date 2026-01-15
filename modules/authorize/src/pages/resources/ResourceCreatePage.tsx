import { Stack } from '@mantine/core';
import {
	BreadcrumbsHeader,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components';
import { FormContainer, FormActions } from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	ResourceFormFields,
	resourceSchema,
	useResourceCreate,
} from '@/features/resources';


function ResourceCreatePageBody(): React.ReactNode {
	const {
		isSubmitting,
		handleCancel,
		handleSubmit,
	} = useResourceCreate();
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

			<FormContainer>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit, form }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data, form))} noValidate>
								<Stack gap='xs'>
									<FormActions isSubmitting={isSubmitting} onCancel={handleCancel} isCreate />
									<ResourceFormFields isCreate />
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</FormContainer>
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
