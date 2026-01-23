import { setActiveModuleAction } from '@nikkierp/ui/appState/routingSlice';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation, useParams } from 'react-router';


export function ModuleSubLayout(): React.ReactNode {
	const dispatch = useDispatch();
	const location = useLocation();
	const { moduleSlug } = useParams();

	React.useEffect(() => {
		dispatch(setActiveModuleAction(moduleSlug));
	}, [location]);

	return <Outlet />;
}