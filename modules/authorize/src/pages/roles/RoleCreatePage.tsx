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

import { RoleFormFields } from '@/features/roles/components';
import roleSchema from '@/features/roles/role-schema.json';

import { useRoleCreateHandlers } from './hooks';


function RoleCreatePageBody(): React.ReactNode {
	const {
		isSubmitting,
		handleCancel,
		handleSubmit,
	} = useRoleCreateHandlers();
	const { t: translate } = useTranslation();
	const schema = roleSchema as ModelSchema;

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
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='xs'>
									<FormActions isSubmitting={isSubmitting} onCancel={handleCancel} isCreate />
									<RoleFormFields isCreate />
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

