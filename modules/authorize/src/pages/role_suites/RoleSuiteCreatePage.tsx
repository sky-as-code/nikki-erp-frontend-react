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

import { MOCK_ORGS } from '@/features/orgs/mockOrgs';
import {
	RoleSuiteFormFields,
	RoleSuiteRolesSelector,
	RoleSuiteChangesSummary,
} from '@/features/role_suites/components';

import { useRoleSuiteCreateHandlers } from './hooks';

import roleSuiteSchema from '@/features/role_suites/roleSuite-schema.json';


function RoleSuiteCreatePageBody(): React.ReactNode {
	const {
		isSubmitting,
		handleCancel,
		handleSubmit,
		selectedRoleIds,
		setSelectedRoleIds,
		availableRolesByOrg,
		roles,
	} = useRoleSuiteCreateHandlers();
	const { t: translate } = useTranslation();
	const schema = roleSuiteSchema as ModelSchema;

	// Track current orgId to compute available roles
	const [currentOrgId, setCurrentOrgId] = React.useState<string | undefined>(undefined);
	const availableRoles = availableRolesByOrg(currentOrgId);

	// Handle orgId change: filter selectedRoleIds to keep only valid roles
	const handleOrgIdChange = React.useCallback((newOrgId: string | undefined) => {
		setCurrentOrgId(newOrgId);
		// Get available roles for the new orgId
		const newAvailableRoles = availableRolesByOrg(newOrgId);
		const availableRoleIds = new Set(newAvailableRoles.map((r) => r.id));
		// Filter selectedRoleIds to only keep roles that are still valid
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
										orgs={MOCK_ORGS}
										onOrgIdChange={handleOrgIdChange}
									/>
									<RoleSuiteChangesSummary
										originalRoleIds={[]}
										selectedRoleIds={selectedRoleIds}
										allRoles={roles}
									/>
									<RoleSuiteRolesSelector
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

