import { cleanFormData } from '@nikkierp/common/utils';
import { useUIState } from '@nikkierp/shell/contexts';
import { useUserContext } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import type { Role } from '@/features/roles';
import type { RoleSuite } from '@/features/roleSuites';

import { AuthorizeDispatch, roleActions, roleSuiteActions, selectCreateRoleSuite, selectRoleState } from '@/appState';


function useRolesLoader(dispatch: AuthorizeDispatch, roles: Role[]) {
	React.useEffect(() => {
		if (roles.length === 0) {
			dispatch(roleActions.listRoles({}));
		}
	}, [roles.length]);
}

/**
 * Cross-org validation logic:
 * - Suite org = null (domain) → only domain roles (roles with orgId = null)
 * - Suite org = specific → domain roles + same org roles
 */
function useAvailableRolesByOrg(roles: Role[]) {
	return React.useCallback((orgId?: string) => {
		// Domain level suite: only show domain roles
		if (!orgId) return roles.filter((r: Role) => !r.orgId);
		// Org-specific suite: show domain roles + same org roles
		return roles.filter((r: Role) => !r.orgId || r.orgId === orgId);
	}, [roles]);
}

function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}, [location]);
}

function useCreateState() {
	const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>([]);
	return { selectedRoleIds, setSelectedRoleIds };
}


export function useRoleSuiteCreate() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const { roles } = useMicroAppSelector(selectRoleState);
	const create = useMicroAppSelector(selectCreateRoleSuite);
	const { selectedRoleIds, setSelectedRoleIds } = useCreateState();
	const userContext = useUserContext();

	const isSubmitting = create.status === 'pending';

	useRolesLoader(dispatch, roles);
	const handleCancel = useCancelHandler(navigate, location);
	const availableRolesByOrg = useAvailableRolesByOrg(roles);
	const handleSubmit = useCreateSubmitHandler(dispatch, selectedRoleIds, roles, userContext.user!.id);

	React.useEffect(() => {
		if (create.status === 'success') {
			const name = create.data?.name ?? '';
			const msg = translate('nikki.authorize.role_suite.messages.create_success', { name });
			notification.showInfo(msg, translate('nikki.general.messages.success'));
			dispatch(roleSuiteActions.resetCreateRoleSuite());
			handleCancel();
		}
		if (create.status === 'error') {
			const errorMsg = create.error ?? translate('nikki.general.errors.create_failed');
			notification.showError(errorMsg, translate('nikki.general.messages.error'));
			dispatch(roleSuiteActions.resetCreateRoleSuite());
		}
	}, [create, notification, translate]);

	return {
		isSubmitting, handleCancel, handleSubmit, selectedRoleIds, setSelectedRoleIds, availableRolesByOrg, roles,
	};
}

function useCreateSubmitHandler(
	dispatch: AuthorizeDispatch,
	selectedRoleIds: string[],
	roles: Role[],
	userId: string,
) {
	return React.useCallback((data: unknown) => {
		const formData = cleanFormData(data as Partial<RoleSuite>);
		formData.createdBy = userId;
		formData.roleIds = selectedRoleIds;

		dispatch(roleSuiteActions.createRoleSuite(formData as RoleSuite));
	}, [selectedRoleIds, userId]);
}

