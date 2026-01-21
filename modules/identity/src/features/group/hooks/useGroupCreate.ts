
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useUIState } from '../../../../../shell/src/context/UIProviders';
import { IdentityDispatch, groupActions } from '../../../appState';
import { selectCreateGroup } from '../../../appState/group';

// eslint-disable-next-line max-lines-per-function
export function useGroupCreateHandlers() {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const activeOrg = useActiveOrgWithDetails();

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
		if (activeOrg) {
			dispatch(groupActions.createGroup({
				...data,
				orgId: activeOrg.id,
			}));
		}
	};

	return {
		isLoading,
		onSubmit: handleCreate,
	};
}
