import { Stack } from '@mantine/core';
import { BreadcrumbsHeader, FormFieldProvider, FormStyleProvider, withWindowTitle } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	RoleSuiteFormActions,
	RoleSuiteFormContainer,
	RoleSuiteFormFields,
	RoleSuiteRolesSelector,
} from '@/features/role_suites/components/role_suite_form';

import { useRoleSuiteCreateHandlers } from './hooks/useRoleSuiteCreate';

import roleSuiteSchema from '@/features/role_suites/roleSuite-schema.json';


function RoleSuiteCreatePageBody(): React.ReactNode {
	const {
		isSubmitting,
		handleCancel,
		handleSubmit,
		selectedRoleIds,
		setSelectedRoleIds,
		availableRolesByOrg,
	} = useRoleSuiteCreateHandlers();
	const { t: translate } = useTranslation();
	const schema = roleSuiteSchema as ModelSchema;

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.role_suite.title_create')}
				autoBuild={true}
				segmentKey='role-suites'
				parentTitle={translate('nikki.authorize.role_suite.title')}
			/>

			<RoleSuiteFormContainer>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit, form }) => {
							const orgId = form.watch('orgId') || undefined;
							const availableRoles = availableRolesByOrg(orgId);

							return (
								<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
									<Stack gap='xs'>
										<RoleSuiteFormActions
											isSubmitting={isSubmitting}
											onCancel={handleCancel}
											isCreate
										/>
										<RoleSuiteFormFields isCreate />
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
							);
						}}
					</FormFieldProvider>
				</FormStyleProvider>
			</RoleSuiteFormContainer>
		</Stack>
	);
}

export const RoleSuiteCreatePage: React.FC = withWindowTitle('Create Role Suite', RoleSuiteCreatePageBody);

