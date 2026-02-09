import { GLOBAL_CONTEXT_SLUG } from '@nikkierp/shell/constants';
import { setActiveOrgAction } from '@nikkierp/ui/appState/routingSlice';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation } from 'react-router';


export function GlobalSubLayout(): React.ReactNode {
	const dispatch = useDispatch();
	const location = useLocation();

	React.useEffect(() => {
		dispatch(setActiveOrgAction(GLOBAL_CONTEXT_SLUG));
	}, [location]);

	return <Outlet />;
}
