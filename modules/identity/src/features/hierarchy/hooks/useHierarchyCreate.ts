import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { IdentityDispatch, hierarchyActions } from '../../../appState';
import { selectCreateHierarchy } from '../../../appState/hierarchy';
import { useOrgScopeRef } from '../../../hooks';


export function useHierarchyCreateHandlers() {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const orgScopeRef = useOrgScopeRef();

	const createCommand = useMicroAppSelector(selectCreateHierarchy);
	const isLoading = createCommand.status === 'pending';

	React.useEffect(() => {
		if (createCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.hierarchy.messages.createSuccess', { name: createCommand.data?.id }), '',
			);
			navigate('..', { relative: 'path' });
			dispatch(hierarchyActions.resetCreateHierarchy());
		}

		if (createCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.hierarchy.messages.createError'), '',
			);
			dispatch(hierarchyActions.resetCreateHierarchy());
		}
	}, [createCommand.status, dispatch, navigate, notification, t]);

	const handleCreate = (data: any) => {
		if (orgScopeRef) {
			dispatch(hierarchyActions.createHierarchy({
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
