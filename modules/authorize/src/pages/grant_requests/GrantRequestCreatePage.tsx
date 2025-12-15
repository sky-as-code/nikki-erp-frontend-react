import { Stack } from '@mantine/core';
import { BreadcrumbsHeader, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	GrantRequestFormActions,
	GrantRequestFormContainer,
	GrantRequestFormFields,
} from '@/features/grant_requests/components/GrantRequestForm';
import grantRequestSchema from '@/features/grant_requests/grant-request-schema.json';

import { useGrantRequestCreateHandlers } from './hooks/useGrantRequestCreate';


function GrantRequestCreatePageBody(): React.ReactNode {
	const {
		isSubmitting,
		handleCancel,
		handleSubmit,
	} = useGrantRequestCreateHandlers();
	const { t: translate } = useTranslation();
	const schema = grantRequestSchema as ModelSchema;

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.grant_request.title_create')}
				autoBuild={true}
				segmentKey='grant-requests'
				parentTitle={translate('nikki.authorize.grant_request.title')}
			/>

			<GrantRequestFormContainer>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='xs'>
									<GrantRequestFormActions
										isSubmitting={isSubmitting}
										onCancel={handleCancel}
										isCreate
									/>
									<GrantRequestFormFields isCreate />
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</GrantRequestFormContainer>
		</Stack>
	);
}

const GrantRequestCreatePageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.grant_request.title_create');
	}, [translate]);
	return <GrantRequestCreatePageBody />;
};

export const GrantRequestCreatePage: React.FC = GrantRequestCreatePageWithTitle;
