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

export function useRoleSuiteDetailData() {
	const { roleSuiteId } = useParams<{ roleSuiteId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const {
		roleSuites,
		isLoadingList,
		roleSuiteDetail,
		isLoadingDetail,
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
		isLoading: isLoadingList || isLoadingDetail,
	};
}

function validateUpdateData(
	formData: Partial<RoleSuite>,
	roleSuite: RoleSuite,
	selectedRoleIds: string[],
	allRoles: Role[],
	notification: NotificationType,
	translate: TFunction,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
): boolean {
	const suiteOrgId = roleSuite.orgId || undefined;
	const invalidRole = validateRoleOrgConstraints(selectedRoleIds, allRoles, suiteOrgId);
	if (invalidRole) {
		notification.showError(
			translate('nikki.general.errors.invalid_change'),
			translate('nikki.general.messages.error'),
		);
		setIsSubmitting(false);
		return false;
	}

	const originalRoleIds = roleSuite.roles?.map((r: Role) => r.id) ?? [];
	if (!validateFormChanges(formData, roleSuite, selectedRoleIds, originalRoleIds, notification, translate)) {
		setIsSubmitting(false);
		return false;
	}

	return true;
}

function handleUpdateSuccess(
	result: { meta: { requestStatus: string } },
	roleSuite: RoleSuite,
	translate: TFunction,
	notification: NotificationType,
	navigate: (path: string) => void,
	location: { pathname: string },
): void {
	if (result.meta.requestStatus === 'fulfilled') {
		notification.showInfo(
			translate('nikki.authorize.role_suite.messages.update_success', { name: roleSuite.name }),
			translate('nikki.general.messages.success'),
		);
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}
}

function handleUpdateError(
	result: { payload: unknown },
	translate: TFunction,
	notification: NotificationType,
): void {
	const errorMessage = typeof result.payload === 'string'
		? result.payload
		: translate('nikki.general.errors.update_failed');
	notification.showError(errorMessage, translate('nikki.general.messages.error'));
}

function performUpdate(
	dispatch: AuthorizeDispatch,
	formData: Partial<RoleSuite>,
	roleSuite: RoleSuite,
	selectedRoleIds: string[],
	notification: NotificationType,
	translate: TFunction,
	navigate: (path: string) => void,
	location: { pathname: string },
): Promise<void> {
	const payload = prepareUpdatePayload(formData, roleSuite, selectedRoleIds);
	return dispatch(roleSuiteActions.updateRoleSuite(payload)).then((result) => {
		handleUpdateSuccess(result, roleSuite, translate, notification, navigate, location);
		if (result.meta.requestStatus !== 'fulfilled') {
			handleUpdateError(result, translate, notification);
		}
	});
}

function validateAndPrepareUpdate(
	formData: Partial<RoleSuite>,
	roleSuite: RoleSuite,
	selectedRoleIds: string[],
	allRoles: Role[],
	notification: NotificationType,
	translate: TFunction,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
): boolean {
	setIsSubmitting(true);
	return validateUpdateData(
		formData,
		roleSuite,
		selectedRoleIds,
		allRoles,
		notification,
		translate,
		setIsSubmitting,
	);
}

function executeUpdate(
	formData: Partial<RoleSuite>,
	roleSuite: RoleSuite,
	selectedRoleIds: string[],
	dispatch: AuthorizeDispatch,
	notification: NotificationType,
	translate: TFunction,
	navigate: (path: string) => void,
	location: { pathname: string },
): Promise<void> {
	try {
		return performUpdate(
			dispatch,
			formData,
			roleSuite,
			selectedRoleIds,
			notification,
			translate,
			navigate,
			location,
		);
	}
	catch {
		notification.showError(
			translate('nikki.general.errors.update_failed'),
			translate('nikki.general.messages.error'),
		);
		return Promise.resolve();
	}
}

function checkValidation(
	formData: Partial<RoleSuite>,
	roleSuite: RoleSuite,
	selectedRoleIds: string[],
	allRoles: Role[],
	notification: NotificationType,
	translate: TFunction,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
): boolean {
	return validateAndPrepareUpdate(
		formData,
		roleSuite,
		selectedRoleIds,
		allRoles,
		notification,
		translate,
		setIsSubmitting,
	);
}

function shouldExecuteUpdate(
	formData: Partial<RoleSuite>,
	roleSuite: RoleSuite,
	selectedRoleIds: string[],
	allRoles: Role[],
	notification: NotificationType,
	translate: TFunction,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
): boolean {
	return checkValidation(
		formData,
		roleSuite,
		selectedRoleIds,
		allRoles,
		notification,
		translate,
		setIsSubmitting,
	);
}

function executeIfValid(
	formData: Partial<RoleSuite>,
	roleSuite: RoleSuite,
	selectedRoleIds: string[],
	dispatch: AuthorizeDispatch,
	notification: NotificationType,
	translate: TFunction,
	navigate: (path: string) => void,
	location: { pathname: string },
): Promise<void> {
	return executeUpdate(
		formData,
		roleSuite,
		selectedRoleIds,
		dispatch,
		notification,
		translate,
		navigate,
		location,
	);
}

function getValidationResult(
	formData: Partial<RoleSuite>,
	roleSuite: RoleSuite,
	selectedRoleIds: string[],
	allRoles: Role[],
	notification: NotificationType,
	translate: TFunction,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
): boolean {
	return shouldExecuteUpdate(
		formData,
		roleSuite,
		selectedRoleIds,
		allRoles,
		notification,
		translate,
		setIsSubmitting,
	);
}

function checkValidationAndExecute(
	formData: Partial<RoleSuite>,
	roleSuite: RoleSuite,
	selectedRoleIds: string[],
	allRoles: Role[],
	dispatch: AuthorizeDispatch,
	notification: NotificationType,
	translate: TFunction,
	navigate: (path: string) => void,
	location: { pathname: string },
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
): Promise<void> {
	const shouldExecute = getValidationResult(
		formData,
		roleSuite,
		selectedRoleIds,
		allRoles,
		notification,
		translate,
		setIsSubmitting,
	);
	if (!shouldExecute) return Promise.resolve();
	return executeIfValid(formData, roleSuite, selectedRoleIds, dispatch, notification, translate, navigate, location);
}

function handleUpdateSubmission(
	formData: Partial<RoleSuite>,
	roleSuite: RoleSuite,
	selectedRoleIds: string[],
	allRoles: Role[],
	dispatch: AuthorizeDispatch,
	notification: NotificationType,
	translate: TFunction,
	navigate: (path: string) => void,
	location: { pathname: string },
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
): Promise<void> {
	return checkValidationAndExecute(
		formData,
		roleSuite,
		selectedRoleIds,
		allRoles,
		dispatch,
		notification,
		translate,
		navigate,
		location,
		setIsSubmitting,
	).finally(() => {
		setIsSubmitting(false);
	});
}

function useUpdateSubmitHandler(
	dispatch: AuthorizeDispatch,
	roleSuite: RoleSuite | undefined,
	selectedRoleIds: string[],
	allRoles: Role[],
	notification: NotificationType,
	translate: TFunction,
	navigate: (path: string) => void,
	location: { pathname: string },
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	return React.useCallback(async (data: unknown) => {
		if (!roleSuite) return;

		const formData = cleanFormData(data as Partial<RoleSuite>);
		await handleUpdateSubmission(
			formData,
			roleSuite,
			selectedRoleIds,
			allRoles,
			dispatch,
			notification,
			translate,
			navigate,
			location,
			setIsSubmitting,
		);
	}, [dispatch, roleSuite, selectedRoleIds, allRoles, notification, translate, navigate, location, setIsSubmitting]);
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

function useSubmitHandler(
	dispatch: AuthorizeDispatch,
	roleSuite: RoleSuite | undefined,
	selectedRoleIds: string[],
	allRoles: Role[],
	notification: NotificationType,
	translate: TFunction,
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	return useUpdateSubmitHandler(
		dispatch,
		roleSuite,
		selectedRoleIds,
		allRoles,
		notification,
		translate,
		navigate,
		location,
		setIsSubmitting,
	);
}

function useHandlers(
	dispatch: AuthorizeDispatch,
	roleSuite: RoleSuite | undefined,
	selectedRoleIds: string[],
	allRoles: Role[],
	notification: NotificationType,
	translate: TFunction,
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(
		dispatch,
		roleSuite,
		selectedRoleIds,
		allRoles,
		notification,
		translate,
		navigate,
		location,
		setIsSubmitting,
	);

	return { handleCancel, handleSubmit };
}

function useStateHooks(roleSuite: RoleSuite | undefined) {
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [selectedRoleIds, setSelectedRoleIds] = useSelectedRoleIds(roleSuite);
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
	const originalRoleIds = React.useMemo(
		() => roleSuite?.roles?.map((r: Role) => r.id) ?? [],
		[roleSuite],
	);
	return {
		isSubmitting,
		setIsSubmitting,
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
	return { navigate, location, dispatch, notification, translate };
}

export function useRoleSuiteDetailHandlers(
	roleSuite: RoleSuite | undefined,
	_availableRoles: Role[],
	allRoles: Role[],
) {
	const { navigate, location, dispatch, notification, translate } = useDetailDependencies();
	const stateHooks = useStateHooks(roleSuite);
	const { handleCancel, handleSubmit } = useHandlers(
		dispatch, roleSuite, stateHooks.selectedRoleIds, allRoles,
		notification, translate, navigate, location, stateHooks.setIsSubmitting,
	);

	return { ...stateHooks, handleCancel, handleSubmit };
}

