import React from 'react';
import { useDispatch } from 'react-redux';

import { useAuthenticatedStatus } from './authSelector';
import { restoreAuthSessionAction } from './authSlice';
import { AppDispatch } from '../appState/store';

/**
 * Restore auth state from local storage when the app is loaded.
 * This provider doesn't manage any state. Use the appState store instead.
 */
export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactNode {
	const status = useAuthenticatedStatus();
	const alreadyHasSession = Boolean(status);
	const dispatch = useDispatch<AppDispatch>();

	React.useEffect(() => {
		if (!alreadyHasSession) {
			dispatch(restoreAuthSessionAction());
		}
	}, []);

	return children;
}
