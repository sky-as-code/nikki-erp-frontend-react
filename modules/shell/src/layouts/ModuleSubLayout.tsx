import { routingService } from '@nikkierp/shell/routing';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';
import { Outlet, useLocation, useParams } from 'react-router';

import { sharedStateService } from '../features/sharedState';


export function ModuleSubLayout(): React.ReactNode {
	const location = useLocation();
	const { moduleSlug } = useParams();
	const { dispatchMethod: setActiveModule } = useServiceLayer(routingService.setActiveModule);
	const { dispatchMethod: setCurrentModule } = useServiceLayer(sharedStateService.setCurrentModule);

	React.useEffect(() => {
		setActiveModule(moduleSlug);
		setCurrentModule(moduleSlug);
	}, [location, moduleSlug, setActiveModule, setCurrentModule]);

	return <Outlet />;
}
