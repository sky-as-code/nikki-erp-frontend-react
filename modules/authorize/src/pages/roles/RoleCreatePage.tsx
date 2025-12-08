import { Stack } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { BackButton } from '@/features/roles/components/Button';
import {
	RoleFormActions,
	RoleFormContainer,
	RoleFormFields,
} from '@/features/roles/components/RoleForm';
import roleSchema from '@/features/roles/role-schema.json';

import { useRoleCreateHandlers } from './hooks/useRoleCreate';


function RoleCreatePageBody(): React.ReactNode {
	const {
		isSubmitting,
		handleGoBack,
		handleSubmit,
	} = useRoleCreateHandlers();
	const { t: translate } = useTranslation();
	const schema = roleSchema as ModelSchema;

	return (
		<Stack gap='md'>
			<BackButton onClick={handleGoBack} />
			<RoleFormContainer title={translate('nikki.authorize.role.title_create')}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='xs'>
									<RoleFormFields isCreate />
									<RoleFormActions isSubmitting={isSubmitting} onCancel={handleGoBack} isCreate />
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</RoleFormContainer>
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

