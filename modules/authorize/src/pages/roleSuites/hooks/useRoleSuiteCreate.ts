import { cleanFormData } from '@nikkierp/common/utils';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { AuthorizeDispatch, roleActions, roleSuiteActions, selectRoleState } from '@/appState';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

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
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>([]);
	return { isSubmitting, setIsSubmitting, selectedRoleIds, setSelectedRoleIds };
}

export function useRoleSuiteCreateHandlers() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const { roles } = useMicroAppSelector(selectRoleState);
	const { isSubmitting, setIsSubmitting, selectedRoleIds, setSelectedRoleIds } = useCreateState();

	useRolesLoader(dispatch, roles);
	const handleCancel = useCancelHandler(navigate, location);
	const availableRolesByOrg = useAvailableRolesByOrg(roles);
	const handleSubmit = useCreateSubmitHandler(
		dispatch, notification, translate, handleCancel, setIsSubmitting, selectedRoleIds, roles,
	);

	return {
		isSubmitting, handleCancel, handleSubmit, selectedRoleIds, setSelectedRoleIds, availableRolesByOrg, roles,
	};
}

function validateCreateData(
	formData: Partial<RoleSuite>,
	selectedRoleIds: string[],
	roles: Role[],
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
): boolean {
	const suiteOrgId = formData.orgId || undefined;
	const invalidRole = validateRoleOrgConstraints(selectedRoleIds, roles, suiteOrgId);
	if (invalidRole) {
		notification.showError(
			translate('nikki.general.errors.invalid_change'),
			translate('nikki.general.messages.error'),
		);
		setIsSubmitting(false);
		return false;
	}
	return true;
}

function handleCreateSuccess(
	result: { meta: { requestStatus: string } },
	formData: Partial<RoleSuite>,
	translate: ReturnType<typeof useTranslation>['t'],
	notification: ReturnType<typeof useUIState>['notification'],
	handleCancel: () => void,
): void {
	if (result.meta.requestStatus === 'fulfilled') {
		const msg = translate('nikki.authorize.role_suite.messages.create_success', {
			name: formData.name,
		});
		notification.showInfo(msg, translate('nikki.general.messages.success'));
		handleCancel();
	}
}

function handleCreateError(
	result: { payload: unknown },
	translate: ReturnType<typeof useTranslation>['t'],
	notification: ReturnType<typeof useUIState>['notification'],
): void {
	const errorMsg = typeof result.payload === 'string'
		? result.payload
		: translate('nikki.general.errors.create_failed');
	notification.showError(errorMsg, translate('nikki.general.messages.error'));
}

function useCreateSubmitHandler(
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	handleCancel: () => void,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
	selectedRoleIds: string[],
	roles: Role[],
) {
	return React.useCallback(async (data: unknown) => {
		const formData = cleanFormData(data as Partial<RoleSuite>);
		setIsSubmitting(true);
		formData.createdBy = '01JWNNJGS70Y07MBEV3AQ0M526';

		if (!validateCreateData(formData, selectedRoleIds, roles, notification, translate, setIsSubmitting)) {
			return;
		}

		formData.roleIds = selectedRoleIds;

		const result = await dispatch(roleSuiteActions.createRoleSuite(
			formData as CreateRoleSuiteInput,
		));

		handleCreateSuccess(result, formData, translate, notification, handleCancel);
		if (result.meta.requestStatus !== 'fulfilled') {
			handleCreateError(result, translate, notification);
		}

		setIsSubmitting(false);
	}, [dispatch, notification, translate, handleCancel, setIsSubmitting, selectedRoleIds, roles]);
}

