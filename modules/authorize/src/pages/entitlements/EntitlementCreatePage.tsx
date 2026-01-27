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

import { EntitlementFormFields, entitlementSchema, useEntitlementCreate } from '@/features/entitlements';
import { useAuthorizePermissions } from '@/hooks/useAuthorizePermissions';


function EntitlementCreatePageBody(): React.ReactNode {
	const { t: translate } = useTranslation();
	const schema = entitlementSchema as ModelSchema;
	const {
		isSubmitting,
		handleCancel,
		handleSubmit,
		resources,
		actions,
	} = useEntitlementCreate();
	const permissions = useAuthorizePermissions();

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.entitlement.title_create')}
				autoBuild={true}
				segmentKey='entitlements'
				parentTitle={translate('nikki.authorize.entitlement.title')}
			/>

			<FormContainer>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit, form }) => (
							<form
								onSubmit={formHandleSubmit((data) => {
									if (!permissions.entitlement.canCreate) return;
									handleSubmit(data, form);
								})}
								noValidate
							>
								<Stack gap='xs'>
									<FormActions
										isSubmitting={isSubmitting}
										onCancel={handleCancel}
										isCreate
										showSubmit={permissions.entitlement.canCreate}
									/>
									<EntitlementFormFields
										isCreate
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

const EntitlementCreatePageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.entitlement.title_create');
	}, [translate]);
	return <EntitlementCreatePageBody />;
};

export const EntitlementCreatePage: React.FC = EntitlementCreatePageWithTitle;

