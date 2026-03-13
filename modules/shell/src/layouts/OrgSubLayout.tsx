import { GLOBAL_CONTEXT_SLUG } from '@nikkierp/shell/constants';
import { useFindMyOrg, useHasGlobalContextAccess } from '@nikkierp/shell/userContext';
import { setActiveOrgAction } from '@nikkierp/ui/appState/routingSlice';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Outlet, useLocation, useParams } from 'react-router';


export function OrgSubLayout(): React.ReactNode {
	const dispatch = useDispatch();
	const location = useLocation();
	const { orgSlug } = useParams();
	const isGlobalContext = orgSlug === GLOBAL_CONTEXT_SLUG;
	const found = useFindMyOrg(orgSlug!);
	const hasGlobalContextAccess = useHasGlobalContextAccess();

	React.useEffect(() => {
		dispatch(setActiveOrgAction(orgSlug!));
	}, [location, orgSlug, dispatch]);

	// Xử lý global context
	if (isGlobalContext) {
		if (!hasGlobalContextAccess) {
			return <Navigate to='/unauthorized' replace />;
		}
		return <Outlet />;
	}

	// Xử lý org context
	if (found) {
		return <Outlet />;
	}
	return <Navigate to='/notfound' replace />;
}