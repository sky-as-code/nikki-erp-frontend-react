import { Stack } from '@mantine/core';
import { BreadcrumbsHeader, FormFieldProvider, FormStyleProvider, withWindowTitle } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	RoleSuiteFormActions,
	RoleSuiteFormContainer,
	RoleSuiteFormFields,
	RoleSuiteLoadingState,
	RoleSuiteNotFound,
	RoleSuiteRolesSelector,
} from '@/features/role_suites/components/role_suite_form';

import { useRoleSuiteDetailData, useRoleSuiteDetailHandlers } from './hooks/useRoleSuiteDetail';

import roleSuiteSchema from '@/features/role_suites/roleSuite-schema.json';


function RoleSuiteDetailPageBody(): React.ReactNode {
	const { roleSuite, availableRoles, roles, isLoading } = useRoleSuiteDetailData();
	const {
		isSubmitting,
		handleCancel,
		handleSubmit,
		selectedRoleIds,
		setSelectedRoleIds,
	} = useRoleSuiteDetailHandlers(roleSuite, availableRoles, roles);
	const { t: translate } = useTranslation();
	const schema = roleSuiteSchema as ModelSchema;

	if (isLoading) {
		return <RoleSuiteLoadingState />;
	}

	if (!roleSuite) {
		return <RoleSuiteNotFound onGoBack={handleCancel} />;
	}

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.role_suite.title_detail')}
				autoBuild={true}
				segmentKey='role-suites'
				parentTitle={translate('nikki.authorize.role_suite.title')}
			/>

			<RoleSuiteFormContainer title={roleSuite.name}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={roleSuite as unknown as Record<string, unknown>}
						modelLoading={isSubmitting}
					>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='xs'>
									<RoleSuiteFormActions
										isSubmitting={isSubmitting}
										onCancel={handleCancel}
										isCreate={false}
									/>
									<RoleSuiteFormFields isCreate={false} />
									<RoleSuiteRolesSelector
										availableRoles={availableRoles}
										selectedRoleIds={selectedRoleIds}
										onAdd={(id) => setSelectedRoleIds((prev) =>
											(prev.includes(id) ? prev : [...prev, id]))}
										onRemove={(id) => setSelectedRoleIds((prev) =>
											prev.filter((x) => x !== id))}
									/>
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</RoleSuiteFormContainer>
		</Stack>
	);
}

export const RoleSuiteDetailPage: React.FC = withWindowTitle('Role Suite Details', RoleSuiteDetailPageBody);

