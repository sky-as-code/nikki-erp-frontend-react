import React from 'react';

import { tempNavigateToAction } from '../appState/routingSlice';
import { useSmartDispatch } from '../hooks/appState';
import { useIsAuthenticated } from '../hooks/auth';


export function AuthorizedGuard({ children }: React.PropsWithChildren): React.ReactNode {
	const dispatch = useSmartDispatch();
	const isAuthenticated = useIsAuthenticated();

	React.useEffect(() => {
		if (!isAuthenticated) {
			dispatch(tempNavigateToAction('/signin'));
		}
	}, [isAuthenticated]);

	return isAuthenticated ? children : null;
}
