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

import type { RoleSuite } from '@/features/role_suites';
import type { Role } from '@/features/roles';
import type { TFunction } from 'i18next';


type NotificationType = ReturnType<typeof useUIState>['notification'];

function validateRoleOrgConstraints(
	selectedRoleIds: string[],
	roles: Role[],
	suiteOrgId?: string,
): string | undefined {
	return selectedRoleIds.find((id) => {
		const role = roles.find((r: Role) => r.id === id);
		if (!role) return false;
		if (!suiteOrgId) return !!role.orgId;
		return role.orgId !== suiteOrgId;
	});
}

function validateFormChanges(
	formData: Partial<RoleSuite>,
	roleSuite: RoleSuite,
	notification: NotificationType,
	translate: TFunction,
): boolean {
	const newDescription = formData.description ?? null;
	const originalDescription = roleSuite.description ?? null;
	const newName = formData.name ?? roleSuite.name;
	const originalName = roleSuite.name;

	if (newDescription === originalDescription && newName === originalName) {
		notification.showError(
			translate('nikki.general.messages.no_changes'),
			translate('nikki.general.messages.error'),
		);
		return false;
	}

	if (originalDescription !== null && newDescription === null) {
		notification.showError(
			translate('nikki.general.messages.invalid_change'),
			translate('nikki.general.messages.error'),
		);
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
	roles: string[];
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
		roles: selectedRoleIds,
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

function useAvailableRoles(roles: Role[], roleSuite: RoleSuite | undefined) {
	return React.useMemo(() => {
		const suiteOrgId = roleSuite?.orgId || undefined;
		if (!suiteOrgId) return roles.filter((r: Role) => !r.orgId);
		return roles.filter((r: Role) => r.orgId === suiteOrgId);
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

	if (!validateFormChanges(formData, roleSuite, notification, translate)) {
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
	return { isSubmitting, setIsSubmitting, selectedRoleIds, setSelectedRoleIds };
}

export function useRoleSuiteDetailHandlers(
	roleSuite: RoleSuite | undefined,
	availableRoles: Role[],
	allRoles: Role[],
) {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const { isSubmitting, setIsSubmitting, selectedRoleIds, setSelectedRoleIds } = useStateHooks(roleSuite);

	const { handleCancel, handleSubmit } = useHandlers(
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

	return {
		isSubmitting,
		handleCancel,
		handleSubmit,
		selectedRoleIds,
		setSelectedRoleIds,
	};
}

