import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { IdentityDispatch, userActions } from '../../../appState';
import { selectCreateUser } from '../../../appState/user';
import { useOrgScopeRef } from '../../../hooks';


export function useUserCreateHandlers() {
	// const dispatch: IdentityDispatch = useMicroAppDispatch();
	// const navigate = useNavigate();
	// const { notification } = useUIState();
	// const { t } = useTranslation();
	// const createCommand = useMicroAppSelector(selectCreateUser);
	// const isLoading = createCommand.status === 'pending';
	// const orgScopeRef = useOrgScopeRef();

	// React.useEffect(() => {
	// 	if (createCommand.status === 'success') {
	// 		notification.showInfo(
	// 			t('nikki.identity.user.messages.createSuccess', { name: createCommand.data?.id }), '',
	// 		);
	// 		dispatch(userActions.resetCreateUser());
	// 		navigate('..', { relative: 'path' });
	// 	}

	// 	if (createCommand.status === 'error') {
	// 		notification.showError(
	// 			t('nikki.identity.user.messages.createError'), '',
	// 		);
	// 		dispatch(userActions.resetCreateUser());
	// 	}

	// }, [createCommand.status, dispatch, navigate, notification, t]);

	// const handleCreate = (data: any) => {
	// 	if (orgScopeRef) {
	// 		dispatch(userActions.createUser({
	// 			data: {
	// 				...data,
	// 				orgId: orgScopeRef,
	// 			},
	// 			scopeRef: orgScopeRef,
	// 		}));
	// 	}
	// };

	// return {
	// 	isLoading,
	// 	handleCreate,
	// };
}