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

import { EntitlementFormFields } from '@/features/entitlements/components/EntitlementFormFields';
import entitlementSchema from '@/features/entitlements/entitlement-schema.json';

import { useEntitlementDetail } from './hooks';


function EntitlementDetailPageBody(): React.ReactNode {
	const { entitlement, isLoading, resources, actions } = useEntitlementDetail.detail();
	const { isSubmitting, handleCancel, handleSubmit } = useEntitlementDetail.handlers(entitlement);
	const { t: translate } = useTranslation();
	const schema = entitlementSchema as ModelSchema;

	if (isLoading) {
		return <LoadingState messageKey='nikki.authorize.entitlement.messages.loading' />;
	}

	if (!entitlement) {
		return (
			<NotFound
				onGoBack={handleCancel}
				messageKey='nikki.authorize.entitlement.messages.not_found'
				showBackButton={false}
			/>
		);
	}

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.entitlement.title_detail')}
				autoBuild={true}
				segmentKey='entitlements'
				parentTitle={translate('nikki.authorize.entitlement.title')}
			/>

			<FormContainer title={entitlement.name}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={entitlement}
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
									<EntitlementFormFields
										isCreate={false}
										resources={resources}
										actions={actions}
									/>
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</FormContainer>
		</Stack>
	);
}

const EntitlementDetailPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.entitlement.title_detail');
	}, [translate]);
	return <EntitlementDetailPageBody />;
};

export const EntitlementDetailPage: React.FC = EntitlementDetailPageWithTitle;

