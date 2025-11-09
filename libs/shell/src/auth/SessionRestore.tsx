import React from 'react';
import { useDispatch } from 'react-redux';

import { useAuthenticatedStatus } from './authSelectors';
import { restoreAuthSessionAction } from './authSlice';
import { AppDispatch } from '../appState/store';


export function SessionRestore({ children }: { children: React.ReactNode }): React.ReactNode {
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
