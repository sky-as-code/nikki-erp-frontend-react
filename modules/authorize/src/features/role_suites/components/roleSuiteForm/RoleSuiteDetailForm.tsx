import { Stack } from '@mantine/core';
import { FormStyleProvider, FormFieldProvider, FormContainer, FormActions } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';

import { MOCK_ORGS } from '@/features/orgs/mockOrgs';

import { RoleSuiteChangesSummary } from '../RoleSuiteChangesSummary';
import { RoleSuiteFormFields } from './RoleSuiteFormFields';
import { RoleSuiteRolesSelector } from './RoleSuiteRolesSelector';

import type { RoleSuite } from '@/features/role_suites';
import type { Role } from '@/features/roles';

import roleSuiteSchema from '@/features/role_suites/roleSuite-schema.json';


interface RoleSuiteDetailFormProps {
	roleSuite: RoleSuite;
	availableRoles: Role[];
	roles: Role[];
	isSubmitting: boolean;
	handleCancel: () => void;
	selectedRoleIds: string[];
	setSelectedRoleIds: React.Dispatch<React.SetStateAction<string[]>>;
	originalRoleIds: string[];
	onFormSubmit: (data: unknown) => void;
}

export const RoleSuiteDetailForm: React.FC<RoleSuiteDetailFormProps> = ({
	roleSuite, availableRoles, roles, isSubmitting, handleCancel,
	selectedRoleIds, setSelectedRoleIds, originalRoleIds, onFormSubmit,
}) => {
	const schema = roleSuiteSchema as ModelSchema;

	return (
		<FormContainer title={roleSuite.name}>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='update'
					modelSchema={schema}
					modelValue={roleSuite}
					modelLoading={isSubmitting}
				>
					{({ handleSubmit: formHandleSubmit }) => (
						<form onSubmit={formHandleSubmit(onFormSubmit)} noValidate>
							<Stack gap='md'>
								<FormActions
									isSubmitting={isSubmitting}
									onCancel={handleCancel}
									isCreate={false}
								/>
								<RoleSuiteFormFields isCreate={false} orgs={MOCK_ORGS} />
								<RoleSuiteChangesSummary
									originalRoleIds={originalRoleIds}
									selectedRoleIds={selectedRoleIds}
									allRoles={roles}
								/>
								<RoleSuiteRolesSelector
									availableRoles={availableRoles}
									selectedRoleIds={selectedRoleIds}
									originalRoleIds={originalRoleIds}
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
		</FormContainer>
	);
};