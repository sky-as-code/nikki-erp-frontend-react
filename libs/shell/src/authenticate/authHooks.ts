import React from 'react';

import { useIsAuthenticated, useIsAuthenticatePending, useRestoreAuthSession } from './authSelectors';


export function useTryRestoreSession(): void {
	const isAuthenticatePending = useIsAuthenticatePending();
	const isAuthenticated = useIsAuthenticated();
	const { dispatchMethod: restoreAuthSession, result } = useRestoreAuthSession();

	React.useEffect(() => {
		if (isAuthenticatePending) return;
		if (!isAuthenticated && !result.isFulfilled) {
			restoreAuthSession();
		}
	}, [isAuthenticated, result.isFulfilled]);
}
