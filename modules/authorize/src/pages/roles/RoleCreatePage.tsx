import { Stack } from '@mantine/core';
import { GLOBAL_CONTEXT_SLUG } from '@nikkierp/shell/constants';
import { useActiveOrgWithDetails, useMyOrgs } from '@nikkierp/shell/userContext';
import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import {
	BreadcrumbsHeader,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components';
import { FormContainer, FormActions } from '@nikkierp/ui/components/form';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	AuthorizeDispatch,
	identityActions,
	selectGroupList,
	selectUserList,
} from '@/appState';
import { RoleFormFields, roleSchema, useRoleCreate } from '@/features/roles';
import { useAuthorizePermissions } from '@/hooks/useAuthorizePermissions';


function RoleCreatePageBody(): React.ReactNode {
	const { orgSlug } = useActiveOrgModule();
	const activeOrg = useActiveOrgWithDetails();
	const assignedOrgs = useMyOrgs();
	const isGlobalContext = orgSlug === GLOBAL_CONTEXT_SLUG;
	const currentOrgId = activeOrg?.id;
	const mappedAssignedOrgs = React.useMemo(() => assignedOrgs.map((org) => ({
		id: org.id,
		displayName: org.name,
		slug: org.slug,
		status: 'active' as const,
	})), [assignedOrgs]);
	const {
		isSubmitting,
		handleCancel,
		handleSubmit,
	} = useRoleCreate(!isGlobalContext ? currentOrgId : undefined);
	const { t: translate } = useTranslation();
	const schema = roleSchema as ModelSchema;
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const users = useMicroAppSelector(selectUserList);
	const groups = useMicroAppSelector(selectGroupList);
	const permissions = useAuthorizePermissions();

	React.useEffect(() => {
		if (users.length === 0) {
			dispatch(identityActions.listUsers());
		}
		if (groups.length === 0) {
			dispatch(identityActions.listGroups());
		}
	}, [dispatch, users.length, groups.length]);

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.role.title_create')}
				autoBuild={true}
				segmentKey='roles'
				parentTitle={translate('nikki.authorize.role.title')}
			/>

			<FormContainer>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit }) => (
							<form
								onSubmit={formHandleSubmit((data) => {
									if (!permissions.role.canCreate) return;
									handleSubmit(data);
								})}
								noValidate
							>
								<Stack gap='xs'>
									<FormActions
										isSubmitting={isSubmitting}
										onCancel={handleCancel}
										isCreate
										showSubmit={permissions.role.canCreate}
									/>
									<RoleFormFields
										isCreate
										orgs={mappedAssignedOrgs}
										users={users}
										groups={groups}
										showOrgFieldOnCreate={isGlobalContext}
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

const RoleCreatePageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.role.title_create');
	}, [translate]);
	return <RoleCreatePageBody />;
};

export const RoleCreatePage: React.FC = RoleCreatePageWithTitle;

