import { Stack } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider, withWindowTitle } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { BackButton } from '@/features/roles/components/Button';
import {
	RoleDetailActions,
	RoleFormContainer,
	RoleFormFields,
	RoleLoadingState,
	RoleNotFound,
} from '@/features/roles/components/RoleForm';
import roleSchema from '@/features/roles/role-schema.json';
import { Role } from '@/features/roles/types';

import { useRoleDetailData, useRoleDetailHandlers } from './hooks/useRoleDetail';


function RoleDetailForm({
	role,
	isSubmitting,
	handleGoBack,
	handleSubmit,
	handleAddEntitlements,
	handleRemoveEntitlements,
	translate,
	schema,
}: {
	role: Role;
	isSubmitting: boolean;
	handleGoBack: () => void;
	handleSubmit: (data: unknown) => void;
	handleAddEntitlements: () => void;
	handleRemoveEntitlements: () => void;
	translate: (key: string) => string;
	schema: ModelSchema;
}) {
	return (
		<RoleFormContainer title={translate('nikki.authorize.role.title_detail')}>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='update'
					modelSchema={schema}
					modelValue={role as unknown as Record<string, unknown>}
					modelLoading={isSubmitting}
				>
					{({ handleSubmit: formHandleSubmit }) => (
						<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
							<Stack gap='xs'>
								<RoleFormFields isCreate={false} />
								<RoleDetailActions
									role={role}
									isSubmitting={isSubmitting}
									onUpdate={() => {}}
									onAddEntitlements={handleAddEntitlements}
									onRemoveEntitlements={handleRemoveEntitlements}
									onCancel={handleGoBack}
								/>
							</Stack>
						</form>
					)}
				</FormFieldProvider>
			</FormStyleProvider>
		</RoleFormContainer>
	);
}

function RoleDetailPageBody(): React.ReactNode {
	const navigate = useNavigate();
	const { role, isLoading } = useRoleDetailData();
	const { isSubmitting, handleGoBack, handleSubmit } = useRoleDetailHandlers(role);
	const { t: translate } = useTranslation();
	const schema = roleSchema as ModelSchema;

	if (isLoading) {
		return <RoleLoadingState />;
	}

	if (!role) {
		return <RoleNotFound onGoBack={handleGoBack} />;
	}

	const handleAddEntitlements = React.useCallback(() => {
		navigate('add-entitlements');
	}, [navigate]);

	const handleRemoveEntitlements = React.useCallback(() => {
		// TODO: Implement remove entitlements
	}, []);

	return (
		<Stack gap='md'>
			<BackButton onClick={handleGoBack} />
			<RoleDetailForm
				role={role}
				isSubmitting={isSubmitting}
				handleGoBack={handleGoBack}
				handleSubmit={handleSubmit}
				handleAddEntitlements={handleAddEntitlements}
				handleRemoveEntitlements={handleRemoveEntitlements}
				translate={translate}
				schema={schema}
			/>
		</Stack>
	);
}

export const RoleDetailPage: React.FC = withWindowTitle('Role Details', RoleDetailPageBody);
