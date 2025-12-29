import { Stack } from '@mantine/core';
import { BreadcrumbsHeader, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	AuthorizeDispatch,
	identityActions,
	roleActions,
	roleSuiteActions,
	selectGroupList,
	selectRoleList,
	selectRoleSuiteList,
	selectUserList,
} from '@/appState';
import {
	GrantRequestFormActions,
	GrantRequestFormContainer,
	GrantRequestFormFields,
} from '@/features/grant_requests/components';
import grantRequestSchema from '@/features/grant_requests/grant-request-schema.json';

import { useGrantRequestCreateHandlers } from './hooks';


function GrantRequestCreatePageBody(): React.ReactNode {
	const {
		isSubmitting,
		handleCancel,
		handleSubmit,
	} = useGrantRequestCreateHandlers();
	const { t: translate } = useTranslation();
	const schema = grantRequestSchema as ModelSchema;
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();

	const roles = useMicroAppSelector(selectRoleList);
	const roleSuites = useMicroAppSelector(selectRoleSuiteList);
	const users = useMicroAppSelector(selectUserList);
	const groups = useMicroAppSelector(selectGroupList);

	React.useEffect(() => {
		if (roles.length === 0) {
			dispatch(roleActions.listRoles());
		}
		if (roleSuites.length === 0) {
			dispatch(roleSuiteActions.listRoleSuites());
		}
		if (users.length === 0) {
			dispatch(identityActions.listUsers());
		}
		if (groups.length === 0) {
			dispatch(identityActions.listGroups());
		}
	}, [dispatch, roles.length, roleSuites.length, users.length, groups.length]);

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.grant_request.title_create')}
				autoBuild={true}
				segmentKey='grant-requests'
				parentTitle={translate('nikki.authorize.grant_request.title')}
			/>

			<GrantRequestFormContainer>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='xs'>
									<GrantRequestFormActions
										isSubmitting={isSubmitting}
										onCancel={handleCancel}
										isCreate
									/>
									<GrantRequestFormFields
										isCreate
										roles={roles}
										roleSuites={roleSuites}
										users={users}
										groups={groups}
									/>
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</GrantRequestFormContainer>
		</Stack>
	);
}

const GrantRequestCreatePageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.grant_request.title_create');
	}, [translate]);
	return <GrantRequestCreatePageBody />;
};

export const GrantRequestCreatePage: React.FC = GrantRequestCreatePageWithTitle;
