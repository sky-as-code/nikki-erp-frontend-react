import { cleanFormData } from '@nikkierp/common/utils';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import { AuthorizeDispatch, roleActions, selectRoleState } from '@/appState';
import { Role } from '@/features/roles/types';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { TFunction } from 'i18next';


// ============ Helper Functions ============

function findRoleById(roleId: string | undefined, roles: Role[], roleDetail: Role | null) {
	if (!roleId) return undefined;
	const fromList = roles.find((e: Role) => e.id === roleId);
	if (fromList) return fromList;
	return roleDetail?.id === roleId ? roleDetail : undefined;
}

function validateChanges(
	formData: Partial<Role>,
	role: Role,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: TFunction,
): { isValid: boolean; newName?: string; newDescription?: string | null } {
	const newDescription = formData.description ?? null;
	const originalDescription = role.description ?? null;
	const newName = formData.name ?? role.name;

	if (newDescription === originalDescription && newName === role.name) {
		notification.showError(translate('nikki.general.messages.no_changes'), translate('nikki.general.messages.error'));
		return { isValid: false };
	}

	if (originalDescription !== null && newDescription === null) {
		const msg = translate('nikki.general.messages.invalid_change');
		notification.showError(msg, translate('nikki.general.messages.error'));
		return { isValid: false };
	}

	return { isValid: true, newName, newDescription };
}

function buildUpdatePayload(role: Role, validation: ReturnType<typeof validateChanges>) {
	const descChanged = validation.newDescription !== (role.description ?? null);
	return {
		id: role.id,
		etag: role.etag || '',
		name: validation.newName !== role.name ? validation.newName : undefined,
		description: descChanged ? (validation.newDescription ?? undefined) : undefined,
	};
}


// ============ Data Hook ============

export function useRoleDetailData() {
	const { roleId } = useParams<{ roleId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { roles, isLoadingList, roleDetail, isLoadingDetail } = useMicroAppSelector(selectRoleState);

	const role = React.useMemo(() => findRoleById(roleId, roles, roleDetail), [roleId, roles, roleDetail]);

	React.useEffect(() => {
		if (roleId && !role) dispatch(roleActions.getRole(roleId));
	}, [dispatch, roleId, role]);

	React.useEffect(() => {
		if (roles.length === 0) dispatch(roleActions.listRoles());
	}, [dispatch, roles.length]);

	return { role, isLoading: isLoadingList || isLoadingDetail };
}


// ============ Handlers Hook ============

export function useRoleDetailHandlers(role: Role | undefined) {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleGoBack = React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);

	const handleSubmit = useSubmitHandler(role, dispatch, notification, translate, setIsSubmitting, handleGoBack);

	return { isSubmitting, handleGoBack, handleSubmit };
}


// ============ Submit Handler ============

function useSubmitHandler(
	role: Role | undefined,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: TFunction,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
	handleGoBack: () => void,
) {
	return React.useCallback(async (data: unknown) => {
		if (!role) return;

		const formData = cleanFormData(data as Partial<Role>);
		const validation = validateChanges(formData, role, notification, translate);
		if (!validation.isValid) return;

		setIsSubmitting(true);
		const result = await dispatch(roleActions.updateRole(buildUpdatePayload(role, validation)));

		if (result.meta.requestStatus === 'fulfilled') {
			const successMsg = translate('nikki.authorize.role.messages.update_success', { name: role.name });
			notification.showInfo(successMsg, translate('nikki.general.messages.success'));
			handleGoBack();
		}
		else {
			const errorMsg = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.update_failed');
			notification.showError(errorMsg, translate('nikki.general.messages.error'));
		}

		setIsSubmitting(false);
	}, [dispatch, notification, role, translate, handleGoBack, setIsSubmitting]);
}
