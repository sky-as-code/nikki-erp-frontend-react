import { Stack } from '@mantine/core';
import {
	BreadcrumbsHeader,
	ConfirmModal,
	FormContainer,
	FormStyleProvider,
	FormFieldProvider,
	FormActions,
	LoadingState,
	NotFound,
} from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Group, Org, User } from '@/features/identities';

import {
	AuthorizeDispatch,
	identityActions,
	selectGroupList,
	selectOrgList,
	selectUserList,
} from '@/appState';
import {
	RolesSelector,
	RoleSuiteChangesSummary,
	RoleSuiteFormFields,
	roleSuiteSchema,
	useRoleSuiteDetail,
} from '@/features/roleSuites';


function RoleSuiteDetailForm({
	roleSuite,
	handlers,
	availableRoles,
	roles,
	formDataRef,
	orgs,
	users,
	groups,
}: {
	roleSuite: NonNullable<ReturnType<typeof useRoleSuiteDetail.detail>['roleSuite']>;
	handlers: ReturnType<typeof useRoleSuiteDetail.handlers>;
	availableRoles: ReturnType<typeof useRoleSuiteDetail.detail>['availableRoles'];
	roles: ReturnType<typeof useRoleSuiteDetail.detail>['roles'];
	formDataRef: React.MutableRefObject<unknown>;
	orgs: Org[];
	users: User[];
	groups: Group[];
}) {
	const schema = roleSuiteSchema as ModelSchema;

	const handleFormSubmit = (data: unknown) => {
		formDataRef.current = data;
		handlers.setIsConfirmDialogOpen(true);
	};

	return (
		<FormContainer title={roleSuite.name}>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='update'
					modelSchema={schema}
					modelValue={roleSuite}
					modelLoading={handlers.isSubmitting}
				>
					{({ handleSubmit: formHandleSubmit }) => (
						<form onSubmit={formHandleSubmit(handleFormSubmit)} noValidate>
							<Stack gap='md'>
								<FormActions
									isSubmitting={handlers.isSubmitting}
									onCancel={handlers.handleCancel}
									isCreate={false}
								/>
								<RoleSuiteFormFields isCreate={false} orgs={orgs} users={users} groups={groups} />
								<RoleSuiteChangesSummary
									originalRoleIds={handlers.originalRoleIds}
									selectedRoleIds={handlers.selectedRoleIds}
									allRoles={roles}
								/>
								<RolesSelector
									availableRoles={availableRoles}
									selectedRoleIds={handlers.selectedRoleIds}
									originalRoleIds={handlers.originalRoleIds}
									onAdd={(id) => handlers.setSelectedRoleIds((prev) =>
										(prev.includes(id) ? prev : [...prev, id]))}
									onRemove={(id) => handlers.setSelectedRoleIds((prev) =>
										prev.filter((x) => x !== id))}
								/>
							</Stack>
						</form>
					)}
				</FormFieldProvider>
			</FormStyleProvider>
		</FormContainer>
	);
}

function RoleSuiteConfirmModal({
	roleSuite,
	handlers,
	formDataRef,
}: {
	roleSuite: NonNullable<ReturnType<typeof useRoleSuiteDetail.detail>['roleSuite']>;
	handlers: ReturnType<typeof useRoleSuiteDetail.handlers>;
	formDataRef: React.MutableRefObject<unknown>;
}) {
	const { t: translate } = useTranslation();

	const handleConfirmUpdate = () => {
		if (formDataRef.current) handlers.handleSubmit(formDataRef.current);
		handlers.setIsConfirmDialogOpen(false);
	};

	return (
		<ConfirmModal
			opened={handlers.isConfirmDialogOpen}
			onClose={() => handlers.setIsConfirmDialogOpen(false)}
			onConfirm={handleConfirmUpdate}
			title={translate('nikki.authorize.role_suite.confirm.title')}
			message={translate('nikki.authorize.role_suite.confirm.message', { name: roleSuite.name })}
			confirmLabel={translate('nikki.general.actions.confirm')}
			cancelLabel={translate('nikki.general.actions.cancel')}
		/>
	);
}

function RoleSuiteDetailFormContent({
	roleSuite,
	handlers,
	availableRoles,
	roles,
	formDataRef,
	orgs,
	users,
	groups,
}: {
	roleSuite: NonNullable<ReturnType<typeof useRoleSuiteDetail.detail>['roleSuite']>;
	handlers: ReturnType<typeof useRoleSuiteDetail.handlers>;
	availableRoles: ReturnType<typeof useRoleSuiteDetail.detail>['availableRoles'];
	roles: ReturnType<typeof useRoleSuiteDetail.detail>['roles'];
	formDataRef: React.MutableRefObject<unknown>;
	orgs: Org[];
	users: User[];
	groups: Group[];
}) {
	return (
		<>
			<RoleSuiteDetailForm
				roleSuite={roleSuite}
				handlers={handlers}
				availableRoles={availableRoles}
				roles={roles}
				formDataRef={formDataRef}
				orgs={orgs}
				users={users}
				groups={groups}
			/>
			<RoleSuiteConfirmModal
				roleSuite={roleSuite}
				handlers={handlers}
				formDataRef={formDataRef}
			/>
		</>
	);
}

function RoleSuiteDetailPageBody(): React.ReactNode {
	const { roleSuite, availableRoles, roles, isLoading } = useRoleSuiteDetail.detail();
	const handlers = useRoleSuiteDetail.handlers(roleSuite, availableRoles, roles);
	const { t: translate } = useTranslation();
	const formDataRef = React.useRef<unknown>(null);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const orgs = useMicroAppSelector(selectOrgList);
	const users = useMicroAppSelector(selectUserList);
	const groups = useMicroAppSelector(selectGroupList);

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
	}, [dispatch, orgs.length, users.length, groups.length]);

	if (isLoading) {
		return <LoadingState messageKey='nikki.authorize.role_suite.messages.loading' />;
	}
	if (!roleSuite) {
		return (
			<NotFound
				onGoBack={handlers.handleCancel}
				messageKey='nikki.authorize.role_suite.messages.not_found'
				showBackButton={false}
			/>
		);
	}

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.role_suite.title_detail')}
				autoBuild={true}
				segmentKey='role-suites'
				parentTitle={translate('nikki.authorize.role_suite.title')}
			/>
			<RoleSuiteDetailFormContent
				roleSuite={roleSuite}
				handlers={handlers}
				availableRoles={availableRoles}
				roles={roles}
				formDataRef={formDataRef}
				orgs={orgs}
				users={users}
				groups={groups}
			/>
		</Stack>
	);
}

const RoleSuiteDetailPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.role_suite.title_detail');
	}, [translate]);
	return <RoleSuiteDetailPageBody />;
};

export const RoleSuiteDetailPage: React.FC = RoleSuiteDetailPageWithTitle;
