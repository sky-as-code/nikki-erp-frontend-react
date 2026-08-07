import { routingService } from '@nikkierp/shell/routing';
import { useFindMyOrg } from '@nikkierp/shell/userContext';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router';

import { sharedStateService } from '../features/sharedState';


export function OrgSubLayout(): React.ReactNode {
	const location = useLocation();
	const { orgSlug } = useParams();
	const found = useFindMyOrg(orgSlug!);
	const { dispatchMethod: setActiveOrg } = useServiceLayer(routingService.setActiveOrg);
	const { dispatchMethod: setCurrentOrgId } = useServiceLayer(sharedStateService.setCurrentOrgId);

	React.useEffect(() => {
		setActiveOrg(orgSlug!);
	}, [location, orgSlug, setActiveOrg]);

	// The URL carries the slug, but an API call needs the id, and resolving one to the other
	// needs the org list from `me/context`. Keyed on `found?.id` so this re-runs when that
	// fetch lands — on a hard reload it has usually not resolved by the first render.
	React.useEffect(() => {
		setCurrentOrgId(found?.id ?? null);
	}, [found?.id, setCurrentOrgId]);

	// Xử lý org context
	if (found) {
		return <Outlet />;
	}
	return <Navigate to='/notfound' replace />;
}
