import { Stack } from '@mantine/core';
import {
	BreadcrumbsHeader,
	FormFieldProvider,
	FormStyleProvider,
	LoadingState,
	NotFound,
} from '@nikkierp/ui/components';
import { FormContainer } from '@nikkierp/ui/components/form';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
	AuthorizeDispatch,
	identityActions,
	selectGroupList,
	selectOrgList,
	selectUserList,
} from '@/appState';
import {
	RoleDetailActions,
	RoleFormFields,
	AssignedEntitlementsList,
	roleSchema,
	useRoleDetailData,
	useRoleDetail,
} from '@/features/roles';


function RoleDetailPageBody(): React.ReactNode {
	const navigate = useNavigate();
	const { role, isLoading } = useRoleDetailData();
	const { isSubmitting, handleGoBack, handleSubmit } = useRoleDetail(role);
	const { t: translate } = useTranslation();
	const schema = roleSchema as ModelSchema;
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const orgs = useMicroAppSelector(selectOrgList);
	const users = useMicroAppSelector(selectUserList);
	const groups = useMicroAppSelector(selectGroupList);

	const handleAddEntitlements = React.useCallback(() => navigate('add-entitlements'), [navigate]);
	const handleRemoveEntitlements = React.useCallback(() => navigate('remove-entitlements'), [navigate]);

	React.useEffect(() => {
		if (orgs.length === 0) {
			dispatch(identityActions.listOrgs());
		}
		if (users.length === 0) {
			dispatch(identityActions.listUsers());
		}
		if (groups.length === 0) {
			dispatch(identityActions.listGroups());
		}
	}, [orgs.length, users.length, groups.length]);

	if (isLoading) {
		return <LoadingState messageKey='nikki.authorize.role.messages.loading' />;
	}
	if (!role) {
		return (
			<NotFound
				onGoBack={handleGoBack}
				messageKey='nikki.authorize.role.messages.not_found'
				showBackButton={false}
			/>
		);
	}

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.role.title_detail')}
				autoBuild={true}
				segmentKey='roles'
				parentTitle={translate('nikki.authorize.role.title')}
			/>

			<FormContainer title={role.name}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={role}
						modelLoading={isSubmitting}
					>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={(e) => {
								formHandleSubmit((data) => {
									handleSubmit(data);
								})(e);
							}} noValidate>
								<Stack gap='xs'>
									<RoleDetailActions
										role={role}
										isSubmitting={isSubmitting}
										onAddEntitlements={handleAddEntitlements}
										onRemoveEntitlements={handleRemoveEntitlements}
										onCancel={handleGoBack}
									/>
									<RoleFormFields isCreate={false} orgs={orgs} users={users} groups={groups} />
									<AssignedEntitlementsList
										entitlements={role.entitlements || []}
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

const RoleDetailPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.role.title_detail');
	}, [translate]);
	return <RoleDetailPageBody />;
};

export const RoleDetailPage: React.FC = RoleDetailPageWithTitle;
