import { cleanFormData } from '@nikkierp/common/utils';
import { GLOBAL_CONTEXT_SLUG } from '@nikkierp/shell/constants';
import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import type { TFunction } from 'i18next';

import {
	AuthorizeDispatch,
	identityActions,
	roleActions,
	selectGroupList,
	selectOrgList,
	selectRoleState,
	selectUserList,
	selectUpdateRole,
} from '@/appState';
import { Role } from '@/features/roles/types';


type NotificationType = ReturnType<typeof useUIState>['notification'];

interface ValidationResult {
	isValid: boolean;
	newName?: string;
	newDescription?: string | null;
}

function validateRoleChanges(
	formData: Partial<Role>,
	role: Role,
	notification: NotificationType,
	translate: TFunction,
): ValidationResult {
	const newDescription = formData.description ?? null;
	const originalDescription = role.description ?? null;
	const newName = formData.name ?? role.name;

	if (newDescription === originalDescription && newName === role.name) {
		notification.showError(translate('nikki.general.messages.no_changes'), translate('nikki.general.messages.error'));
		return { isValid: false };
	}

	const hasOriginalDesc = originalDescription !== null && originalDescription !== undefined && originalDescription !== '';
	if (hasOriginalDesc && newDescription === null) {
		notification.showError(translate('nikki.general.messages.invalid_change'), translate('nikki.general.messages.error'));
		return { isValid: false };
	}

	return { isValid: true, newName, newDescription };
}

function buildUpdatePayload(role: Role, validation: ValidationResult) {
	const descChanged = validation.newDescription !== (role.description ?? null);
	return {
		id: role.id,
		etag: role.etag,
		role: {
			...role,
			name: validation.newName !== role.name ? validation.newName : undefined,
			description: descChanged ? (validation.newDescription ?? undefined) : undefined,
		},
	};
}

function useRoleFromState(roleId: string | undefined) {
	const { roles, roleDetail } = useMicroAppSelector(selectRoleState);
	return React.useMemo(() => {
		if (!roleId) return undefined;
		if (roleDetail?.id === roleId) return roleDetail;
		return roles.find((e: Role) => e.id === roleId);
	}, [roleId, roles, roleDetail]);
}

function useRoleDataFetching(roleId: string | undefined) {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { roles, list } = useMicroAppSelector(selectRoleState);

	React.useEffect(() => {
		if (roleId) dispatch(roleActions.getRole(roleId));
	}, [dispatch, roleId]);

	React.useEffect(() => {
		if (roles.length === 0) dispatch(roleActions.listRoles({}));
	}, [dispatch, roles.length]);

	return { isLoadingList: list.isLoading, isLoadingDetail: list.isLoading };
}

function useRoleDetailLookups() {
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

	return { orgs, users, groups };
}

export function useRoleDetailData() {
	const { roleId } = useParams<{ roleId: string }>();
	const { orgSlug } = useActiveOrgModule();
	const activeOrg = useActiveOrgWithDetails();
	const isGlobalContext = orgSlug === GLOBAL_CONTEXT_SLUG;
	const currentOrgId = activeOrg?.id;
	const role = useRoleFromState(roleId);
	const {
		isLoadingList,
		isLoadingDetail,
	} = useRoleDataFetching(roleId);

	return {
		role: React.useMemo(() => {
			if (!role) return role;
			const roleOrgId = role.orgId ?? role.org?.id;
			if (isGlobalContext) return role;
			// In org context, user can view domain roles and current org roles only
			if (!roleOrgId) return role;
			if (currentOrgId && roleOrgId === currentOrgId) return role;
			return undefined;
		}, [role, isGlobalContext, currentOrgId]),
		isLoading: isLoadingList || isLoadingDetail,
	};
}


export function useRoleDetail(role: Role | undefined) {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const update = useMicroAppSelector(selectUpdateRole);

	const isSubmitting = update.status === 'pending';

	const navigateBack = React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);

	const handleSubmit = React.useCallback((data: unknown) => {
		if (!role) return;

		const formData = cleanFormData(data as Partial<Role>);
		const validation = validateRoleChanges(formData, role, notification, translate);

		if (!validation.isValid) return;

		const payload = buildUpdatePayload(role, validation);
		dispatch(roleActions.updateRole({ id: role.id, etag: role.etag || '', role: payload.role as Role }));
	}, [dispatch, notification, role, translate]);

	React.useEffect(() => {
		if (update.status === 'success') {
			notification.showInfo(translate('nikki.authorize.role.messages.update_success', { name: role?.name }), translate('nikki.general.messages.success'));
			dispatch(roleActions.resetUpdateRole());
			navigateBack();
		}
		if (update.status === 'error') {
			const errorMsg = update.error ?? translate('nikki.general.errors.update_failed');
			notification.showError(errorMsg, translate('nikki.general.messages.error'));
			dispatch(roleActions.resetUpdateRole());
		}
	}, [update.status, update.error, role, notification, translate, dispatch, navigateBack]);

	return { isSubmitting, handleGoBack: navigateBack, handleSubmit };
}

export function useRoleDetailPage() {
	const { orgSlug } = useActiveOrgModule();
	const activeOrg = useActiveOrgWithDetails();
	const isGlobalContext = orgSlug === GLOBAL_CONTEXT_SLUG;
	const currentOrgId = activeOrg?.id;
	const navigate = useNavigate();
	const { role, isLoading } = useRoleDetailData();
	const handlers = useRoleDetail(role);
	const lookups = useRoleDetailLookups();
	const canMutateRole = React.useMemo(() => {
		if (!role) return false;
		if (isGlobalContext) return true;
		const roleOrgId = role.orgId ?? role.org?.id;
		return Boolean(currentOrgId) && roleOrgId === currentOrgId;
	}, [role, isGlobalContext, currentOrgId]);

	const handleAddEntitlements = React.useCallback(() => navigate('add-entitlements'), [navigate]);
	const handleRemoveEntitlements = React.useCallback(() => navigate('remove-entitlements'), [navigate]);

	return {
		role,
		isLoading,
		canMutateRole,
		...handlers,
		...lookups,
		handleAddEntitlements,
		handleRemoveEntitlements,
	};
}
