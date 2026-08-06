import { routingService } from '@nikkierp/shell/routing';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';
import { Outlet, useLocation, useParams } from 'react-router';


export function ModuleSubLayout(): React.ReactNode {
	const location = useLocation();
	const { moduleSlug } = useParams();
	const { dispatchMethod: setActiveModule } = useServiceLayer(routingService.setActiveModule);

	React.useEffect(() => {
		setActiveModule(moduleSlug);
	}, [location]);

	return <Outlet />;
}
