import { AuthorizeDispatch, roleActions, roleSuiteActions, selectCreateRoleSuite, selectRoleState } from '@/appState';
import { cleanFormData } from '@nikkierp/common/utils';
import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';



import type { Role } from '@/features/roles';
import type { RoleSuite } from '@/features/roleSuites';


type CreateRoleSuiteInput = Omit<RoleSuite, 'id' | 'createdAt' | 'updatedAt' | 'etag' | 'rolesCount' | 'ownerName'>;

/**
 * Validates that selected roles comply with cross-org constraints:
 * - Suite org = null → roles must have org = null
 * - Suite org = specific → roles can have org = null OR same org
 */
function validateRoleOrgConstraints(
	selectedRoleIds: string[],
	roles: Role[],
	suiteOrgId?: string,
): string | undefined {
	return selectedRoleIds.find((id) => {
		const role = roles.find((r: Role) => r.id === id);
		if (!role) return false;
		// Domain suite: role must be domain
		if (!suiteOrgId) return !!role.orgId;
		// Org suite: role can be domain OR same org
		return role.orgId !== undefined && role.orgId !== suiteOrgId;
	});
}

function useRolesLoader(dispatch: AuthorizeDispatch, roles: Role[]) {
	React.useEffect(() => {
		if (roles.length === 0) {
			dispatch(roleActions.listRoles());
		}
	}, [dispatch, roles.length]);
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
	}, [navigate, location]);
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

	const isSubmitting = create.status === 'pending';

	useRolesLoader(dispatch, roles);
	const handleCancel = useCancelHandler(navigate, location);
	const availableRolesByOrg = useAvailableRolesByOrg(roles);
	const handleSubmit = useCreateSubmitHandler(dispatch, selectedRoleIds, roles);

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
	}, [create.status, create.data, create.error, notification, translate, dispatch, handleCancel]);

	return {
		isSubmitting, handleCancel, handleSubmit, selectedRoleIds, setSelectedRoleIds, availableRolesByOrg, roles,
	};
}

function useCreateSubmitHandler(
	dispatch: AuthorizeDispatch,
	selectedRoleIds: string[],
	roles: Role[],
) {
	return React.useCallback((data: unknown) => {
		const formData = cleanFormData(data as Partial<RoleSuite>);
		formData.createdBy = '01JWNNJGS70Y07MBEV3AQ0M526';
		formData.roleIds = selectedRoleIds;

		dispatch(roleSuiteActions.createRoleSuite(formData as CreateRoleSuiteInput));
	}, [dispatch, selectedRoleIds]);
}

