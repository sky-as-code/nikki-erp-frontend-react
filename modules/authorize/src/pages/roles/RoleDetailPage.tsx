import { Stack } from '@mantine/core';
import { BreadcrumbsHeader, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { AssignedEntitlementsList } from '@/features/roles/components/RoleEntitlements';
import {
	RoleDetailActions,
	RoleFormContainer,
	RoleFormFields,
	RoleLoadingState,
	RoleNotFound,
} from '@/features/roles/components/RoleForm';
import roleSchema from '@/features/roles/role-schema.json';

import { useRoleDetailData, useRoleDetailHandlers } from './hooks/useRoleDetail';


function RoleDetailPageBody(): React.ReactNode {
	const navigate = useNavigate();
	const { role, resources, actions, isLoading } = useRoleDetailData();
	const { isSubmitting, handleGoBack, handleSubmit } = useRoleDetailHandlers(role);
	const { t: translate } = useTranslation();
	const schema = roleSchema as ModelSchema;

	const handleAddEntitlements = React.useCallback(() => navigate('add-entitlements'), [navigate]);
	const handleRemoveEntitlements = React.useCallback(() => navigate('remove-entitlements'), [navigate]);

	if (isLoading) return <RoleLoadingState />;
	if (!role) return <RoleNotFound onGoBack={handleGoBack} />;

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.role.title_detail')}
				autoBuild={true}
				segmentKey='roles'
				parentTitle={translate('nikki.authorize.role.title')}
			/>

			<RoleFormContainer title={role.name}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={role}
						modelLoading={isSubmitting}
					>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={(e) => {
								formHandleSubmit((data) => {
									handleSubmit(data);
								})(e);
							}} noValidate>
								<Stack gap='xs'>
									<RoleDetailActions
										role={role}
										isSubmitting={isSubmitting}
										onAddEntitlements={handleAddEntitlements}
										onRemoveEntitlements={handleRemoveEntitlements}
										onCancel={handleGoBack}
									/>
									<RoleFormFields isCreate={false} />
									<AssignedEntitlementsList
										entitlements={role.entitlements || []}
										resources={resources}
										actions={actions}
									/>
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</RoleFormContainer>
		</Stack>
	);
}

const RoleDetailPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.role.title_detail');
	}, [translate]);
	return <RoleDetailPageBody />;
};

export const RoleDetailPage: React.FC = RoleDetailPageWithTitle;
