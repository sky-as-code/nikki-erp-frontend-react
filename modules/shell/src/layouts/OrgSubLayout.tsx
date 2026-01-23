import { useFindMyOrg } from '@nikkierp/shell/userContext';
import { setActiveOrgAction } from '@nikkierp/ui/appState/routingSlice';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Outlet, useLocation, useParams } from 'react-router';


export function OrgSubLayout(): React.ReactNode {
	const dispatch = useDispatch();
	const location = useLocation();
	const { orgSlug } = useParams();
	const found = useFindMyOrg(orgSlug!);

	React.useEffect(() => {
		dispatch(setActiveOrgAction(orgSlug!));
	}, [location]);

	if (found) {
		return <Outlet />;
	}
	return <Navigate to='/notfound' replace />;
}