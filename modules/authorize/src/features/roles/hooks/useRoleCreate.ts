import { cleanFormData } from '@nikkierp/common/utils';
import { useUIState } from '@nikkierp/shell/contexts';
import { useUserContext } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { AuthorizeDispatch, roleActions, selectCreateRole } from '@/appState';
import { Role } from '@/features/roles/types';


export function useRoleCreate() {
	const userContext = useUserContext();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const create = useMicroAppSelector(selectCreateRole);

	const isSubmitting = create.status === 'pending';

	const handleCancel = React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, []);

	const handleSubmit = React.useCallback((data: unknown) => {
		const formData = cleanFormData(data as Partial<Role>);
		formData.createdBy = userContext.user!.id;
		dispatch(roleActions.createRole(formData as Role));
	}, []);

	React.useEffect(() => {
		if (create.status === 'success') {
			const name = create.data?.name ?? '';
			const msg = translate('nikki.authorize.role.messages.create_success', { name });
			notification.showInfo(msg, translate('nikki.general.messages.success'));
			dispatch(roleActions.resetCreateRole());
			handleCancel();
		}
		if (create.status === 'error') {
			const errorMsg = create.error ?? translate('nikki.general.errors.create_failed');
			notification.showError(errorMsg, translate('nikki.general.messages.error'));
			dispatch(roleActions.resetCreateRole());
		}
	}, [create, notification, translate]);

	return { isSubmitting, handleCancel, handleSubmit };
}
