import { Stack } from '@mantine/core';
import {
	BreadcrumbsHeader,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components';
import { FormContainer } from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	RoleDetailActions,
	RoleFormFields,
	AssignedEntitlementsList,
	roleSchema,
	useRoleDetailPage,
} from '@/features/roles';
import { useAuthorizePermissions } from '@/hooks/useAuthorizePermissions';



function RoleDetailPageBody(): React.ReactNode {
	const {
		role,
		isSubmitting,
		handleGoBack,
		handleSubmit,
		orgs,
		users,
		groups,
		handleAddEntitlements,
		handleRemoveEntitlements,
	} = useRoleDetailPage();
	const { t: translate } = useTranslation();
	const schema = roleSchema as ModelSchema;
	const permissions = useAuthorizePermissions();

	if (!role) return null;

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.role.title_detail')}
				autoBuild={true}
				segmentKey='roles'
				parentTitle={translate('nikki.authorize.role.title')}
			/>

			<FormContainer title={role.name}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={role}
						modelLoading={isSubmitting}
					>
						{({ handleSubmit: formHandleSubmit }) => (
							<form
								onSubmit={(e) => {
									if (!permissions.role.canUpdate) return;
									formHandleSubmit((data) => {
										handleSubmit(data);
									})(e);
								}}
								noValidate
							>
								<Stack gap='xs'>
									<RoleDetailActions
										role={role}
										isSubmitting={isSubmitting}
										onAddEntitlements={handleAddEntitlements}
										onRemoveEntitlements={handleRemoveEntitlements}
										onCancel={handleGoBack}
										canUpdate={permissions.role.canUpdate}
										canAddEntitlement={permissions.role.canAddEntitlement}
										canRemoveEntitlement={permissions.role.canRemoveEntitlement}
									/>
									<RoleFormFields isCreate={false} orgs={orgs} users={users} groups={groups} />
									<AssignedEntitlementsList
										entitlements={role.entitlements || []}
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

const RoleDetailPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.role.title_detail');
	}, [translate]);
	return <RoleDetailPageBody />;
};

export const RoleDetailPage: React.FC = RoleDetailPageWithTitle;
