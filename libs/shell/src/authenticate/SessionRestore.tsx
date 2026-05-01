import React from 'react';
import { useDispatch } from 'react-redux';

import { useIsAuthenticated } from './authSelectors';
import { actions } from './authSlice';
import { AppDispatch } from '../appState/store';


export function SessionRestore({ children }: { children: React.ReactNode }): React.ReactNode {
	const isAuthenticated = useIsAuthenticated();
	const dispatch = useDispatch<AppDispatch>();

	React.useEffect(() => {
		if (!isAuthenticated) {
			dispatch(actions.restoreAuthSession());
		}
	}, []);

	return children;
}
