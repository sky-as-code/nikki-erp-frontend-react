import { GLOBAL_CONTEXT_SLUG } from '@nikkierp/shell/constants';
import { useHasGlobalContextAccess } from '@nikkierp/shell/userContext';
import { setActiveOrgAction } from '@nikkierp/ui/appState/routingSlice';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router';


export function GlobalSubLayout(): React.ReactNode {
	const dispatch = useDispatch();
	const location = useLocation();
	const hasGlobalContextAccess = useHasGlobalContextAccess();

	React.useEffect(() => {
		dispatch(setActiveOrgAction(GLOBAL_CONTEXT_SLUG));
	}, [location]);

	if (!hasGlobalContextAccess) {
		return <Navigate to='/unauthorized' replace />;
	}

	return <Outlet />;
}
