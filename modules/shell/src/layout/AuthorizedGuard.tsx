import { useIsAuthenticated } from '@nikkierp/shell/auth';
import { tempNavigateToAction } from '@nikkierp/ui/appState/routingSlice';
import React from 'react';
import { useDispatch } from 'react-redux';


export function AuthorizedGuard({ children }: React.PropsWithChildren): React.ReactNode {
	const dispatch = useDispatch();
	const isAuthenticated = useIsAuthenticated();

	React.useEffect(() => {
		if (!isAuthenticated) {
			dispatch(tempNavigateToAction('/signin'));
		}
	}, [isAuthenticated]);

	return isAuthenticated ? children : null;
}
