import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useUIState } from '../../../../../shell/src/context/UIProviders';
import { IdentityDispatch, userActions } from '../../../appState';
import { selectCreateUser } from '../../../appState/user';

// eslint-disable-next-line max-lines-per-function
export function useUserCreateHandlers() {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const activeOrg = useActiveOrgWithDetails();
	const { t } = useTranslation();
	const createCommand = useMicroAppSelector(selectCreateUser);

	React.useEffect(() => {
		if (createCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.user.messages.createSuccess', { name: createCommand.data?.id }), '',
			);
			dispatch(userActions.resetCreateUser());
			navigate('..', { relative: 'path' });
		}

		if (createCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.user.messages.createError'), '',
			);
			dispatch(userActions.resetCreateUser());
		}

	}, [createCommand.status, dispatch, navigate, notification, t]);

	const handleCreate = (data: any) => {
		if (activeOrg) {
			dispatch(userActions.createUser({
				...data,
				orgId: activeOrg.id,
			}));
		}
	};

	return {
		handleCreate,
	};
}