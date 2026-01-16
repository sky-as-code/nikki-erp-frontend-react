import { Stack } from '@mantine/core';
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
	selectOrgList,
} from '@/appState';
import {
	RolesSelector,
	RoleSuiteChangesSummary,
	RoleSuiteFormFields,
	roleSuiteSchema,
	useRoleSuiteCreate,
} from '@/features/roleSuites';


function RoleSuiteCreatePageBody(): React.ReactNode {
	const {
		isSubmitting,
		handleCancel,
		handleSubmit,
		selectedRoleIds,
		setSelectedRoleIds,
		availableRolesByOrg,
		roles,
	} = useRoleSuiteCreate();
	const { t: translate } = useTranslation();
	const schema = roleSuiteSchema as ModelSchema;
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const orgs = useMicroAppSelector(selectOrgList);

	// Track current orgId to compute available roles
	const [currentOrgId, setCurrentOrgId] = React.useState<string | undefined>(undefined);
	const availableRoles = availableRolesByOrg(currentOrgId);

	React.useEffect(() => {
		if (orgs.length === 0) {
			dispatch(identityActions.listOrgs());
		}
	}, [dispatch, orgs.length]);

	// Handle orgId change: filter selectedRoleIds to keep only valid roles
	const handleOrgIdChange = React.useCallback((newOrgId: string | undefined) => {
		setCurrentOrgId(newOrgId);
		const newAvailableRoles = availableRolesByOrg(newOrgId);
		const availableRoleIds = new Set(newAvailableRoles.map((r) => r.id));
		setSelectedRoleIds((prev) => prev.filter((id) => availableRoleIds.has(id)));
	}, [availableRolesByOrg, setSelectedRoleIds]);

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.role_suite.title_create')}
				autoBuild={true}
				segmentKey='role-suites'
				parentTitle={translate('nikki.authorize.role_suite.title')}
			/>

			<FormContainer>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='md'>
									<FormActions
										isSubmitting={isSubmitting}
										onCancel={handleCancel}
										isCreate
									/>
									<RoleSuiteFormFields
										isCreate
										orgs={orgs}
										onOrgIdChange={handleOrgIdChange}
									/>
									<RoleSuiteChangesSummary
										originalRoleIds={[]}
										selectedRoleIds={selectedRoleIds}
										allRoles={roles}
									/>
									<RolesSelector
										availableRoles={availableRoles}
										selectedRoleIds={selectedRoleIds}
										onAdd={(id) => setSelectedRoleIds((prev) =>
											prev.includes(id) ? prev : [...prev, id])}
										onRemove={(id) => setSelectedRoleIds((prev) =>
											prev.filter((x) => x !== id))}
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

const RoleSuiteCreatePageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.role_suite.title_create');
	}, [translate]);
	return <RoleSuiteCreatePageBody />;
};

export const RoleSuiteCreatePage: React.FC = RoleSuiteCreatePageWithTitle;

