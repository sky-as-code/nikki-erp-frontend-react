import React from 'react';

import { useIsAuthenticated, useRestoreAuthSession } from './authSelectors';


export function SessionRestore({ children }: { children: React.ReactNode }): React.ReactNode {
	const isAuthenticated = useIsAuthenticated();
	const { dispatchMethod: restoreAuthSession } = useRestoreAuthSession();

	React.useEffect(() => {
		if (!isAuthenticated) {
			restoreAuthSession();
		}
	}, []);

	return children;
}
