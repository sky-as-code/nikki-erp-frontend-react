import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, resolvePath } from 'react-router';

import { AuthorizeDispatch, grantRequestActions } from '@/appState';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


export function useGrantRequestCreateHandlers() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleCancel = React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);

	const handleSubmit = React.useCallback(async (data: any) => {
		setIsSubmitting(true);
		const result = await dispatch(grantRequestActions.createGrantRequest(data));
		if (result.meta.requestStatus === 'fulfilled') {
			notification.showInfo(
				translate('nikki.authorize.grant_request.messages.create_success'),
				translate('nikki.general.messages.success'),
			);
			handleCancel();
		}
		else {
			const msg = typeof result.payload === 'string'
				? result.payload
				: translate('nikki.general.errors.create_failed');
			notification.showError(msg, translate('nikki.general.messages.error'));
		}
		setIsSubmitting(false);
	}, [dispatch, notification, translate, handleCancel]);

	return { isSubmitting, handleCancel, handleSubmit };
}

