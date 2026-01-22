import { useAuthenticatedStatus, useAuthState } from '@nikkierp/shell/auth';
import { useUserContext } from '@nikkierp/shell/userContext';
import { tempNavigateToAction } from '@nikkierp/ui/appState/routingSlice';
import React from 'react';
import { useDispatch } from 'react-redux';


export function AuthorizedGuard({ children }: React.PropsWithChildren): React.ReactNode {
	const dispatch = useDispatch();
	const status = useAuthenticatedStatus();
	const authState = useAuthState();
	const userContext = useUserContext();
	const {isAuthenticated, isSessionRestoring} = status ?? {};

	// Check if user context is being loaded after successful session restore
	const isUserContextLoading = authState.isSignInSuccess && userContext.user === null && userContext.isLoading;

	React.useEffect(() => {
		// Don't redirect if:
		// 1. Status is null (session not initialized yet)
		// 2. Still loading or restoring session
		// 3. User context is being loaded after successful session restore
		// Only redirect when we're certain user is not authenticated
		if (status !== null && !isSessionRestoring && !isUserContextLoading && !isAuthenticated) {
			console.count('🚀 ~ AuthorizedGuard ~ redirecting to signin');
			dispatch(tempNavigateToAction('/signin'));
		}
	}, [status, isAuthenticated, isSessionRestoring, isUserContextLoading, dispatch]);

	// Show nothing while loading/restoring or if not authenticated
	if (status === null || isSessionRestoring || isUserContextLoading) {
		return null;
	}

	return isAuthenticated ? children : null;
}
