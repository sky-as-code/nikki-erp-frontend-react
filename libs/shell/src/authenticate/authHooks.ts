import React from 'react';
import { useDispatch } from 'react-redux';

import { useIsAuthenticated, useIsAuthenticatePending, useRestoreAuthSession } from './authSelectors';


export function useTryRestoreSession(): void {
	const isAuthenticatePending = useIsAuthenticatePending();
	const isAuthenticated = useIsAuthenticated();
	const restore = useRestoreAuthSession();
	const dispatch = useDispatch();

	React.useEffect(() => {
		if (isAuthenticatePending) return;
		if (!isAuthenticated && !restore.isDone) {
			dispatch(restore.thunkAction() as any);
		}
	}, [isAuthenticated, restore.isDone]);
}
