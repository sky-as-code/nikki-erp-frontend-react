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

import {
	AuthorizeDispatch,
	identityActions,
	selectOrgList,
} from '@/appState';
import { RolesSelector } from '@/features/role_suites/components/RolesSelector';
import { RoleSuiteChangesSummary } from '@/features/role_suites/components/RoleSuiteChangesSummary';
import { RoleSuiteFormFields } from '@/features/role_suites/components/RoleSuiteFormFields';
import roleSuiteSchema from '@/features/role_suites/roleSuite-schema.json';

import { useRoleSuiteDetailData, useRoleSuiteDetailHandlers } from './hooks';

import type { Org } from '@/features/orgs';



function RoleSuiteDetailForm({
	roleSuite,
	handlers,
	availableRoles,
	roles,
	formDataRef,
	orgs,
}: {
	roleSuite: NonNullable<ReturnType<typeof useRoleSuiteDetailData>['roleSuite']>;
	handlers: ReturnType<typeof useRoleSuiteDetailHandlers>;
	availableRoles: ReturnType<typeof useRoleSuiteDetailData>['availableRoles'];
	roles: ReturnType<typeof useRoleSuiteDetailData>['roles'];
	formDataRef: React.MutableRefObject<unknown>;
	orgs: Org[];
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
								<RoleSuiteFormFields isCreate={false} orgs={orgs} />
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
	roleSuite: NonNullable<ReturnType<typeof useRoleSuiteDetailData>['roleSuite']>;
	handlers: ReturnType<typeof useRoleSuiteDetailHandlers>;
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
}: {
	roleSuite: NonNullable<ReturnType<typeof useRoleSuiteDetailData>['roleSuite']>;
	handlers: ReturnType<typeof useRoleSuiteDetailHandlers>;
	availableRoles: ReturnType<typeof useRoleSuiteDetailData>['availableRoles'];
	roles: ReturnType<typeof useRoleSuiteDetailData>['roles'];
	formDataRef: React.MutableRefObject<unknown>;
	orgs: Org[];
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
	const { roleSuite, availableRoles, roles, isLoading } = useRoleSuiteDetailData();
	const handlers = useRoleSuiteDetailHandlers(roleSuite, availableRoles, roles);
	const { t: translate } = useTranslation();
	const formDataRef = React.useRef<unknown>(null);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const orgs = useMicroAppSelector(selectOrgList);

	React.useEffect(() => {
		if (orgs.length === 0) {
			dispatch(identityActions.listOrgs());
		}
	}, [dispatch, orgs.length]);

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
