import { Stack } from '@mantine/core';
import { BreadcrumbsHeader } from '@nikkierp/ui/components';
import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	RoleSuiteDetailForm,
	RoleSuiteLoadingState,
	RoleSuiteNotFound,
} from '@/features/role_suites/components';

import { useRoleSuiteDetailData, useRoleSuiteDetailHandlers } from './hooks';


function RoleSuiteDetailPageBody(): React.ReactNode {
	const { roleSuite, availableRoles, roles, isLoading } = useRoleSuiteDetailData();
	const handlers = useRoleSuiteDetailHandlers(roleSuite, availableRoles, roles);
	const { t: translate } = useTranslation();
	const formDataRef = React.useRef<unknown>(null);

	if (isLoading) return <RoleSuiteLoadingState />;
	if (!roleSuite) return <RoleSuiteNotFound onGoBack={handlers.handleCancel} />;

	const handleFormSubmit = (data: unknown) => {
		formDataRef.current = data;
		handlers.setIsConfirmDialogOpen(true);
	};

	const handleConfirmUpdate = () => {
		if (formDataRef.current) handlers.handleSubmit(formDataRef.current);
		handlers.setIsConfirmDialogOpen(false);
	};

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.role_suite.title_detail')}
				autoBuild={true}
				segmentKey='role-suites'
				parentTitle={translate('nikki.authorize.role_suite.title')}
			/>
			<RoleSuiteDetailForm
				roleSuite={roleSuite}
				availableRoles={availableRoles}
				roles={roles}
				isSubmitting={handlers.isSubmitting}
				handleCancel={handlers.handleCancel}
				selectedRoleIds={handlers.selectedRoleIds}
				setSelectedRoleIds={handlers.setSelectedRoleIds}
				originalRoleIds={handlers.originalRoleIds}
				onFormSubmit={handleFormSubmit}
			/>
			<ConfirmModal
				opened={handlers.isConfirmDialogOpen}
				onClose={() => handlers.setIsConfirmDialogOpen(false)}
				onConfirm={handleConfirmUpdate}
				title={translate('nikki.authorize.role_suite.confirm.title')}
				message={translate('nikki.authorize.role_suite.confirm.message', { name: roleSuite.name })}
				confirmLabel={translate('nikki.general.actions.confirm')}
				cancelLabel={translate('nikki.general.actions.cancel')}
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

