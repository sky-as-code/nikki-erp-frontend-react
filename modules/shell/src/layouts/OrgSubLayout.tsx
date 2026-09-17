import { routingService } from '@nikkierp/shell/routing';
import { useActiveOrg, useGetUserContext } from '@nikkierp/shell/userContext';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';
import { Outlet } from 'react-router';

import { AppLoading } from '../components/Loading';
import { NoOrgPage } from '../components/NoOrgPage';
import { sharedStateService } from '../features/sharedState';


export function OrgSubLayout(): React.ReactNode {
	const activeOrg = useActiveOrg();
	const userContext = useGetUserContext();
	const { dispatchMethod: setActiveOrg } = useServiceLayer(routingService.setActiveOrg);
	const { dispatchMethod: setCurrentOrgId } = useServiceLayer(sharedStateService.setCurrentOrgId);

	// The org no longer comes from the URL, but an API call still needs the id, and resolving it
	// needs the org list from `me/context`. Keyed on the id so this re-runs when that fetch lands
	// — on a hard reload it has usually not resolved by the first render.
	React.useEffect(() => {
		setCurrentOrgId(activeOrg?.id ?? null);
	}, [activeOrg?.id, setCurrentOrgId]);

	// The slug is still published into the routing slice because the nav chrome (Header, MenuBar,
	// ModuleCard, ModuleSwitch) still builds `/{orgSlug}/...` URLs from it. Those call sites go
	// away with the org segment in GLB-005/GLB-008, and this write goes with them.
	React.useEffect(() => {
		setActiveOrg(activeOrg?.slug ?? null);
	}, [activeOrg?.slug, setActiveOrg]);

	if (activeOrg) {
		return <Outlet />;
	}

	// An org list that has not arrived is indistinguishable from a user who has none, so waiting
	// is the only correct answer until the fetch settles — otherwise a hard reload shows the
	// no-organization page to a user who does have one.
	if (userContext.isPending) {
		return <AppLoading />;
	}

	return <NoOrgPage />;
}
