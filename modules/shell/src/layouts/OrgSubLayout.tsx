import { routingService } from '@nikkierp/shell/routing';
import { useFindMyOrg } from '@nikkierp/shell/userContext';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router';


export function OrgSubLayout(): React.ReactNode {
	const location = useLocation();
	const { orgSlug } = useParams();
	const found = useFindMyOrg(orgSlug!);
	const { dispatchMethod: setActiveOrg } = useServiceLayer(routingService.setActiveOrg);

	React.useEffect(() => {
		setActiveOrg(orgSlug!);
	}, [location, orgSlug, setActiveOrg]);

	// Xử lý org context
	if (found) {
		return <Outlet />;
	}
	return <Navigate to='/notfound' replace />;
}
