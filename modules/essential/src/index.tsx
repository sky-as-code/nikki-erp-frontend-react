import { Alert, MantineProvider } from '@mantine/core';
import { schemaRegistry } from '@nikkierp/common/dynamicModel';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, initMicroAppStateContext,
	MicroAppRouter, WidgetRoute, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import { compilePage } from '@nikkierp/viewengine/metadata';
import { useViewEngine } from '@nikkierp/viewengine/render';
import React from 'react';
import { Link } from 'react-router';

import { reducer } from './appState';
import * as c from './constants';
import { registerUomCommands } from './features/uom/commands';
import { registerUomCatCommands } from './features/uomcat/commands';
import { buildEssentialMenu } from './menu';
import { ModuleManagementPage } from './pages/ModuleManagement';
import { OrgHomePage } from './pages/OrgHomePage';
import { buildUomPages } from './pages/uom';
import { buildUomCatPages } from './pages/uomcat';


function Main(props: MicroAppProps) {
	return (
		<MicroAppProvider {...props}>
			<MantineProvider>
				<MicroAppInner {...props} />
			</MantineProvider>
		</MicroAppProvider>
	);
}

/**
 * This module predates the view engine and still owns two hand-written JSX pages, so it drives
 * `MicroAppRouter` directly rather than using `ViewEngineRouter`: the latter renders only
 * compiled pages and has no slot for the legacy routes or the widget routes.
 */
function MicroAppInner(props: MicroAppProps): React.ReactNode {
	const engine = useViewEngine();
	const pages = React.useMemo(
		() => [...buildUomPages(), ...buildUomCatPages()].map(page => compilePage(page, engine)),
		[engine],
	);

	return (
		<MicroAppRouter domType={props.domType} basePath={props.routing.basePath}
			widgetName={props.widgetName}
			widgetProps={props.widgetProps}
		>
			<AppRoutes>
				<AppRoute index element={<EssentialIndexPage />} />
				<AppRoute path='authorized' element={<AuthorizedPage />} />
				<AppRoute path='org-home' element={<OrgHomePage />} />
				<AppRoute path='module-management' element={<ModuleManagementPage />} />
				{pages.map(page => (
					<AppRoute key={page.routePath} path={page.routePath} element={page.element} />
				))}
			</AppRoutes>
			<WidgetRoutes>
				<WidgetRoute name='org-home' Component={OrgHomePage} />
				<WidgetRoute name='module-management' Component={ModuleManagementPage} />
			</WidgetRoutes>
		</MicroAppRouter>
	);
}

function EssentialIndexPage(): React.ReactNode {
	return (
		<>
			<Alert variant='filled' color='blue'><h1>Essential Module</h1></Alert>
			<Link to='authorized' data-testid='essential-link-authorized'>Authorized</Link><br />
			<Link to='org-home' data-testid='essential-link-org-home'>Org Home</Link><br />
			<Link to='module-management' data-testid='essential-link-module-management'>
				Module Management
			</Link><br />
			<Link to='uoms' data-testid='essential-link-uoms'>Units of Measure</Link><br />
			<Link to='uom-categories' data-testid='essential-link-uom-categories'>UoM Categories</Link>
		</>
	);
}

// `AuthorizedGuard` was removed from `@nikkierp/ui/components` during the auth refactor and has
// no replacement yet: `PermissionGuard` covers authorization, not authentication, and is itself
// still stubbed. The route renders unguarded until the authentication guard lands.
function AuthorizedPage(): React.ReactNode {
	return (
		<>
			<p>Essential Authorized Page</p>
			<Link to='/' data-testid='essential-link-shell'>Back to Shell</Link>
		</>
	);
}


const bundle: MicroAppBundle = {
	init({ htmlTag, slug, registerReducer, host }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, {
			htmlTag,
			domType,
		});

		// The legacy pages still read module state through the Shell store; the UoM services
		// keep their own state in `./store`.
		const result = registerReducer(reducer);
		initMicroAppStateContext(result);

		registerModelSchemas();
		host.menuRegistry.register(buildEssentialMenu(slug));
		registerUomCommands(host.commandBus);
		registerUomCatCommands(host.commandBus);

		return {
			domType,
		};
	},
};

export default bundle;

function registerModelSchemas(): void {
	schemaRegistry.register([{
		schemaName: c.UOM_SCHEMA_NAME,
		resourcePath: c.UOM_RESOURCE_PATH,
	}, {
		schemaName: c.UOMCAT_SCHEMA_NAME,
		resourcePath: c.UOMCAT_RESOURCE_PATH,
	}]);
}
