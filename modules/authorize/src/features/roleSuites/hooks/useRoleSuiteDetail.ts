import { cleanFormData } from '@nikkierp/common/utils';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import {
	AuthorizeDispatch,
	roleActions,
	roleSuiteActions,
	selectRoleState,
	selectRoleSuiteState,
	selectUpdateRoleSuite,
} from '@/appState';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { Role } from '@/features/roles';
import type { RoleSuite } from '@/features/roleSuites';
import type { TFunction } from 'i18next';


type NotificationType = ReturnType<typeof useUIState>['notification'];

/**
 * Validates that selected roles comply with cross-org constraints:
 * - Suite org = null (domain) → roles must have org = null
 * - Suite org = specific → roles can have org = null (domain) OR same org
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
		// Domain role (orgId = undefined) is always valid for org suite
		if (!role.orgId) return false;
		return role.orgId !== suiteOrgId;
	});
}

function hasRolesChanged(selectedRoleIds: string[], originalRoleIds: string[]): boolean {
	if (selectedRoleIds.length !== originalRoleIds.length) return true;
	const originalSet = new Set(originalRoleIds);
	return selectedRoleIds.some((id) => !originalSet.has(id));
}

function hasAnyChanges(formData: Partial<RoleSuite>, roleSuite: RoleSuite, selected: string[], original: string[]) {
	const descChanged = (formData.description ?? null) !== (roleSuite.description ?? null);
	const nameChanged = (formData.name ?? roleSuite.name) !== roleSuite.name;
	return descChanged || nameChanged || hasRolesChanged(selected, original);
}

function validateFormChanges(
	formData: Partial<RoleSuite>,
	roleSuite: RoleSuite,
	selectedRoleIds: string[],
	originalRoleIds: string[],
	notification: NotificationType,
	translate: TFunction,
): boolean {
	if (!hasAnyChanges(formData, roleSuite, selectedRoleIds, originalRoleIds)) {
		notification.showError(translate('nikki.general.messages.no_changes'), translate('nikki.general.messages.error'));
		return false;
	}

	return true;
}

function prepareUpdatePayload(
	formData: Partial<RoleSuite>,
	roleSuite: RoleSuite,
	selectedRoleIds: string[],
): {
	id: string;
	etag: string;
	name?: string;
	description?: string;
	roleIds: string[];
} {
	const newDescription = formData.description ?? null;
	const originalDescription = roleSuite.description ?? null;
	const newName = formData.name ?? roleSuite.name;
	const originalName = roleSuite.name;

	return {
		id: roleSuite.id,
		etag: roleSuite.etag || '',
		name: newName !== originalName ? newName : undefined,
		description: newDescription !== originalDescription ? (newDescription ?? undefined) : undefined,
		roleIds: selectedRoleIds,
	};
}

function useRoleSuiteLoader(
	dispatch: AuthorizeDispatch,
	roleSuiteId: string | undefined,
	roleSuite: RoleSuite | undefined,
) {
	React.useEffect(() => {
		if (roleSuiteId && !roleSuite) {
			dispatch(roleSuiteActions.getRoleSuite(roleSuiteId));
		}
	}, [dispatch, roleSuiteId, roleSuite]);
}

function useRoleSuitesListLoader(dispatch: AuthorizeDispatch, roleSuites: RoleSuite[]) {
	React.useEffect(() => {
		if (roleSuites.length === 0) {
			dispatch(roleSuiteActions.listRoleSuites());
		}
	}, [dispatch, roleSuites.length]);
}

function useRolesListLoader(dispatch: AuthorizeDispatch, roles: Role[]) {
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
function useAvailableRoles(roles: Role[], roleSuite: RoleSuite | undefined) {
	return React.useMemo(() => {
		const suiteOrgId = roleSuite?.orgId || undefined;
		// Domain level suite: only show domain roles
		if (!suiteOrgId) return roles.filter((r: Role) => !r.orgId);
		// Org-specific suite: show domain roles + same org roles
		return roles.filter((r: Role) => !r.orgId || r.orgId === suiteOrgId);
	}, [roles, roleSuite?.orgId]);
}

function useRoleSuiteDetailData() {
	const { roleSuiteId } = useParams<{ roleSuiteId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const {
		roleSuites,
		list,
		roleSuiteDetail,
	} = useMicroAppSelector(selectRoleSuiteState);
	const { roles } = useMicroAppSelector(selectRoleState);

	const roleSuite = React.useMemo(() => {
		if (!roleSuiteId) return undefined;

		const fromList = roleSuites.find((e: RoleSuite) => e.id === roleSuiteId);
		if (fromList) return fromList;

		return roleSuiteDetail?.id === roleSuiteId ? roleSuiteDetail : undefined;
	}, [roleSuiteId, roleSuites, roleSuiteDetail]);

	useRoleSuiteLoader(dispatch, roleSuiteId, roleSuite);
	useRoleSuitesListLoader(dispatch, roleSuites);
	useRolesListLoader(dispatch, roles);

	const availableRoles = useAvailableRoles(roles, roleSuite);

	return {
		roleSuite,
		availableRoles,
		roles,
		isLoading: list.isLoading,
	};
}

function validateUpdateData(
	formData: Partial<RoleSuite>,
	roleSuite: RoleSuite,
	selectedRoleIds: string[],
	allRoles: Role[],
	notification: NotificationType,
	translate: TFunction,
): { isValid: boolean; originalRoleIds: string[] } {
	const suiteOrgId = roleSuite.orgId || undefined;
	const invalidRole = validateRoleOrgConstraints(selectedRoleIds, allRoles, suiteOrgId);
	if (invalidRole) {
		notification.showError(
			translate('nikki.general.errors.invalid_change'),
			translate('nikki.general.messages.error'),
		);
		return { isValid: false, originalRoleIds: [] };
	}

	const originalRoleIds = roleSuite.roles?.map((r: Role) => r.id) ?? [];
	if (!validateFormChanges(formData, roleSuite, selectedRoleIds, originalRoleIds, notification, translate)) {
		return { isValid: false, originalRoleIds };
	}

	return { isValid: true, originalRoleIds };
}

function useUpdateSubmitHandler(
	dispatch: AuthorizeDispatch,
	roleSuite: RoleSuite | undefined,
	selectedRoleIds: string[],
	allRoles: Role[],
	notification: NotificationType,
	translate: TFunction,
) {
	return React.useCallback((data: unknown) => {
		if (!roleSuite) return;

		const formData = cleanFormData(data as Partial<RoleSuite>);
		const validation = validateUpdateData(formData, roleSuite, selectedRoleIds, allRoles, notification, translate);

		if (!validation.isValid) return;

		const payload = prepareUpdatePayload(formData, roleSuite, selectedRoleIds);
		dispatch(roleSuiteActions.updateRoleSuite(payload));
	}, [dispatch, roleSuite, selectedRoleIds, allRoles, notification, translate]);
}

function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}, [navigate, location]);
}

function useSelectedRoleIds(roleSuite: RoleSuite | undefined) {
	return React.useState<string[]>(
		roleSuite?.roles?.map((r: Role) => r.id) ?? [],
	);
}

function useStateHooks(roleSuite: RoleSuite | undefined) {
	const [selectedRoleIds, setSelectedRoleIds] = useSelectedRoleIds(roleSuite);
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
	const originalRoleIds = React.useMemo(
		() => roleSuite?.roles?.map((r: Role) => r.id) ?? [],
		[roleSuite],
	);
	return {
		selectedRoleIds,
		setSelectedRoleIds,
		isConfirmDialogOpen,
		setIsConfirmDialogOpen,
		originalRoleIds,
	};
}

function useDetailDependencies() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const update = useMicroAppSelector(selectUpdateRoleSuite);
	return { navigate, location, dispatch, notification, translate, update };
}

function useRoleSuiteDetailHandlers(
	roleSuite: RoleSuite | undefined,
	_availableRoles: Role[],
	allRoles: Role[],
) {
	const { navigate, location, dispatch, notification, translate, update } = useDetailDependencies();
	const stateHooks = useStateHooks(roleSuite);
	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useUpdateSubmitHandler(
		dispatch, roleSuite, stateHooks.selectedRoleIds, allRoles, notification, translate,
	);

	const isSubmitting = update.status === 'pending';

	React.useEffect(() => {
		if (update.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.role_suite.messages.update_success', { name: roleSuite?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(roleSuiteActions.resetUpdateRoleSuite());
			const parent = resolvePath('..', location.pathname).pathname;
			navigate(parent);
		}
		if (update.status === 'error') {
			const errorMessage = update.error ?? translate('nikki.general.errors.update_failed');
			notification.showError(errorMessage, translate('nikki.general.messages.error'));
			dispatch(roleSuiteActions.resetUpdateRoleSuite());
		}
	}, [update.status, update.error, roleSuite, notification, translate, dispatch, navigate, location]);

	return { ...stateHooks, isSubmitting, handleCancel, handleSubmit };
}

export const useRoleSuiteDetail = {
	detail: useRoleSuiteDetailData,
	handlers: useRoleSuiteDetailHandlers,
};
