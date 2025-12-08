import { cleanFormData } from '@nikkierp/common/utils';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import {
	AuthorizeDispatch,
	actionActions,
	resourceActions,
	roleActions,
	selectActionState,
	selectResourceState,
	selectRoleState,
} from '@/appState';
import { Role } from '@/features/roles/types';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { TFunction } from 'i18next';


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
		etag: role.etag || '',
		name: validation.newName !== role.name ? validation.newName : undefined,
		description: descChanged ? (validation.newDescription ?? undefined) : undefined,
	};
}


export function useRoleDetailData() {
	const { roleId } = useParams<{ roleId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { roles, isLoadingList, roleDetail, isLoadingDetail } = useMicroAppSelector(selectRoleState);
	const { resources } = useMicroAppSelector(selectResourceState);
	const { actions } = useMicroAppSelector(selectActionState);

	const role = React.useMemo(() => {
		if (!roleId) return undefined;
		if (roleDetail?.id === roleId) return roleDetail;
		return roles.find((e: Role) => e.id === roleId);
	}, [roleId, roles, roleDetail]);

	React.useEffect(() => {
		if (roleId) dispatch(roleActions.getRole(roleId));
	}, [dispatch, roleId]);

	React.useEffect(() => {
		if (roles.length === 0) dispatch(roleActions.listRoles());
	}, [dispatch, roles.length]);

	React.useEffect(() => {
		dispatch(resourceActions.listResources());
		dispatch(actionActions.listActions(undefined));
	}, [dispatch]);

	return { role, resources, actions, isLoading: isLoadingList || isLoadingDetail };
}

export function useRoleDetailHandlers(role: Role | undefined) {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const navigateBack = React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);

	const handleSubmit = React.useCallback(async (data: unknown) => {
		if (!role) return;

		const formData = cleanFormData(data as Partial<Role>);
		const validation = validateRoleChanges(formData, role, notification, translate);

		if (!validation.isValid) return;

		setIsSubmitting(true);
		const result = await dispatch(roleActions.updateRole(buildUpdatePayload(role, validation)));

		if (result.meta.requestStatus === 'fulfilled') {
			notification.showInfo(translate('nikki.authorize.role.messages.update_success', { name: role.name }), translate('nikki.general.messages.success'));
			navigateBack();
		}
		else {
			const errorMsg = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.update_failed');
			notification.showError(errorMsg, translate('nikki.general.messages.error'));
		}

		setIsSubmitting(false);
	}, [dispatch, notification, role, translate, navigateBack]);

	return { isSubmitting, handleGoBack: navigateBack, handleSubmit };
}
