import { routingService } from '@nikkierp/shell/routing';
import { useFindMyOrg, useGetUserContext } from '@nikkierp/shell/userContext';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';
import { Outlet, useLocation, useParams } from 'react-router';

import { AppLoading } from '../components/Loading';
import { sharedStateService } from '../features/sharedState';
import { NotFoundPage } from '../pages/NotFoundPage';


export function OrgSubLayout(): React.ReactNode {
	const location = useLocation();
	const { orgSlug } = useParams();
	const found = useFindMyOrg(orgSlug!);
	const userContext = useGetUserContext();
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

	if (found) {
		return <Outlet />;
	}

	// An org list that has not arrived is indistinguishable from a slug that does not exist, so
	// waiting is the only correct answer until the fetch settles — otherwise a hard reload shows
	// Not Found for an org the user does have.
	if (userContext.isPending) {
		return <AppLoading />;
	}

	// Rendered in place rather than redirected: the URL keeps naming the org the user asked for,
	// which is what they need to see to correct it.
	return <NotFoundPage />;
}
