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

import { ActionFormFields, actionSchema, useActionDetail } from '@/features/actions';


function ActionDetailPageBody(): React.ReactNode {
	const { action, isLoading } = useActionDetail.detail();
	const { isSubmitting, handleCancel, handleSubmit } = useActionDetail.handlers(action);
	const { t: translate } = useTranslation();
	const schema = actionSchema as ModelSchema;

	if (isLoading) {
		return <LoadingState messageKey='nikki.authorize.action.messages.loading' />;
	}

	if (!action) {
		return (
			<NotFound
				onGoBack={handleCancel}
				messageKey='nikki.authorize.action.messages.not_found'
				showBackButton={false}
			/>
		);
	}

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.action.title_detail')}
				autoBuild={true}
				segmentKey='actions'
				parentTitle={translate('nikki.authorize.action.title')}
			/>

			<FormContainer title={action.name}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={action}
						modelLoading={isSubmitting}
					>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='xs'>
									<FormActions
										isSubmitting={isSubmitting}
										onCancel={handleCancel}
										isCreate={false}
									/>
									<ActionFormFields isCreate={false} />
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</FormContainer>
		</Stack>
	);
}

const ActionDetailPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.action.title_detail');
	}, [translate]);
	return <ActionDetailPageBody />;
};

export const ActionDetailPage: React.FC = ActionDetailPageWithTitle;

