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

import { GrantRequestFormFields, grantRequestSchema, useGrantRequestCreate } from '@/features/grantRequests';
import { useAuthorizePermissions } from '@/hooks/useAuthorizePermissions';


function GrantRequestCreatePageBody(): React.ReactNode {
	const {
		isSubmitting,
		handleCancel,
		handleSubmit,
		roles,
		roleSuites,
		orgs,
		filteredUsers,
		filteredGroups,
		selectedOrgId,
		setSelectedOrgId,
		selectedReceiverOrgId,
		setSelectedReceiverOrgId,
	} = useGrantRequestCreate();
	const { t: translate } = useTranslation();
	const schema = grantRequestSchema as ModelSchema;
	const permissions = useAuthorizePermissions();

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.grant_request.title_create')}
				autoBuild={true}
				segmentKey='grant-requests'
				parentTitle={translate('nikki.authorize.grant_request.title')}
			/>

			<FormContainer>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit }) => (
							<form
								onSubmit={formHandleSubmit((data) => {
									if (!permissions.grantRequest.canCreate) return;
									handleSubmit(data);
								})}
								noValidate
							>
								<Stack gap='xs'>
									<FormActions
										isSubmitting={isSubmitting}
										onCancel={handleCancel}
										isCreate
										showSubmit={permissions.grantRequest.canCreate}
									/>
									<GrantRequestFormFields
										isCreate
										roles={roles}
										roleSuites={roleSuites}
										users={filteredUsers}
										groups={filteredGroups}
										orgs={orgs}
										selectedOrgId={selectedOrgId}
										onOrgIdChange={setSelectedOrgId}
										selectedReceiverOrgId={selectedReceiverOrgId}
										onReceiverOrgIdChange={setSelectedReceiverOrgId}
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

const GrantRequestCreatePageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.grant_request.title_create');
	}, [translate]);
	return <GrantRequestCreatePageBody />;
};

export const GrantRequestCreatePage: React.FC = GrantRequestCreatePageWithTitle;
