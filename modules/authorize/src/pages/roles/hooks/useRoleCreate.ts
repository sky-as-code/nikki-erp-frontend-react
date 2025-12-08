import { cleanFormData } from '@nikkierp/common/utils';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { AuthorizeDispatch, roleActions } from '@/appState';
import { Role } from '@/features/roles/types';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


type CreateRoleInput = Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'etag' | 'entitlementsCount' | 'assignmentsCount' | 'suitesCount' | 'ownerName'>;


export function useRoleCreateHandlers() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleGoBack = React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);

	const handleSubmit = useCreateSubmitHandler(dispatch, notification, translate, handleGoBack, setIsSubmitting);

	return { isSubmitting, handleGoBack, handleSubmit };
}

function useCreateSubmitHandler(
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	handleGoBack: () => void,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	return React.useCallback(async (data: unknown) => {
		const formData = cleanFormData(data as Partial<Role>);
		formData.createdBy = '01JWNNJGS70Y07MBEV3AQ0M526';
		setIsSubmitting(true);

		const result = await dispatch(roleActions.createRole(formData as CreateRoleInput));

		if (result.meta.requestStatus === 'fulfilled') {
			const msg = translate('nikki.authorize.role.messages.create_success', { name: formData.name });
			notification.showInfo(msg, translate('nikki.general.messages.success'));
			handleGoBack();
		}
		else {
			const errorMsg = typeof result.payload === 'string'
				? result.payload
				: translate('nikki.general.errors.create_failed');
			notification.showError(errorMsg, translate('nikki.general.messages.error'));
		}

		setIsSubmitting(false);
	}, [dispatch, notification, translate, handleGoBack, setIsSubmitting]);
}
