import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useUIState } from '../../../../../shell/src/context/UIProviders';
import { IdentityDispatch, organizationActions } from '../../../appState';
import { selectCreateOrganization } from '../../../appState/organization';


export function useOrganizationCreateHandlers() {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();

	const createCommand = useMicroAppSelector(selectCreateOrganization);

	React.useEffect(() => {
		if (createCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.organization.messages.createSuccess', { name: createCommand.data?.id }), '',
			);
			navigate('..', { relative: 'path' });
			dispatch(organizationActions.resetCreateOrganization());
		}

		if (createCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.organization.messages.createError'), '',
			);
			dispatch(organizationActions.resetCreateOrganization());
		}
	}, [createCommand.status, dispatch, navigate, notification, t]);

	const handleCreate = (data: any) => {
		dispatch(organizationActions.createOrganization(data));
	};

	return {
		onSubmit: handleCreate,
	};
}
