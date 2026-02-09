
import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { IdentityDispatch, groupActions } from '../../../appState';
import { selectCreateGroup } from '../../../appState/group';
import { useOrgScopeRef } from '../../../hooks';


export function useGroupCreateHandlers() {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const orgScopeRef = useOrgScopeRef();

	const createCommand = useMicroAppSelector(selectCreateGroup);
	const isLoading = createCommand.status === 'loading';

	React.useEffect(() => {
		if (createCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.group.messages.createSuccess', { name: createCommand.data?.id }), '',
			);
			navigate('..', { relative: 'path' });
			dispatch(groupActions.resetCreateGroup());
		}

		if (createCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.group.messages.createError'), '',
			);
			dispatch(groupActions.resetCreateGroup());
		}
	}, [createCommand.status, dispatch, navigate, notification, t]);

	const handleCreate = (data: any) => {
		if (orgScopeRef) {
			dispatch(groupActions.createGroup({
				data: {
					...data,
					orgId: orgScopeRef,
				},
				scopeRef: orgScopeRef,
			}));
		}
	};

	return {
		isLoading,
		onSubmit: handleCreate,
	};
}
