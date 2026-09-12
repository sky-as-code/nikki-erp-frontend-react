import { schemaRegistry } from '@nikkierp/common/dynamicModel';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, MicroAppRouter, WidgetRoute, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import { compilePage } from '@nikkierp/viewengine/metadata';
import { useViewEngine } from '@nikkierp/viewengine/render';
import React from 'react';

import * as c from './constants';
import { registerNotificationCommands } from './features/notification/commands';
import { buildNotificationMenu } from './menu';
import { buildNotificationPages } from './pages/notification';
import { HeaderBell } from './widgets/HeaderBell';


function Main(props: MicroAppProps) {
	return (
		<MicroAppProvider {...props}>
			<MicroAppInner {...props} />
		</MicroAppProvider>
	);
}

const bundle: MicroAppBundle = {
	init({ htmlTag, slug, host }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, {
			htmlTag,
			domType,
		});

		// No `registerReducer`: notification keeps its state in its own store (`./store`), and
		// reaches the Shell only through the command and event buses.
		registerModelSchemas();
		host.menuRegistry.register(buildNotificationMenu(slug));
		registerNotificationCommands(host.commandBus);

		return {
			domType,
		};
	},
};

export default bundle;

function MicroAppInner(props: MicroAppProps): React.ReactNode {
	const engine = useViewEngine();
	const pages = React.useMemo(
		() => buildNotificationPages().map(page => compilePage(page, engine)),
		[engine],
	);

	return (
		<MicroAppRouter domType={props.domType} basePath={props.routing.basePath}
			widgetName={props.widgetName}
			widgetProps={props.widgetProps}
		>
			<AppRoutes>
				{pages.map(page => (
					<AppRoute key={page.routePath} path={page.routePath} element={page.element} />
				))}
			</AppRoutes>
			<WidgetRoutes>
				{/* Mounted by the Shell in the application header. The name is the contract
					between the two; neither imports the other. */}
				<WidgetRoute name='widgets.headerBell' Component={HeaderBell} />
			</WidgetRoutes>
		</MicroAppRouter>
	);
}

function registerModelSchemas(): void {
	schemaRegistry.register([{
		schemaName: c.NOTIFICATION_SCHEMA_NAME,
		resourcePath: c.NOTIFICATION_RESOURCE_PATH,
	}, {
		schemaName: c.NOTIFICATION_RECIPIENT_SCHEMA_NAME,
		resourcePath: c.NOTIFICATION_RECIPIENT_RESOURCE_PATH,
	}, {
		schemaName: c.NOTIFICATION_DELIVERY_SCHEMA_NAME,
		resourcePath: c.NOTIFICATION_DELIVERY_RESOURCE_PATH,
	}]);
}
