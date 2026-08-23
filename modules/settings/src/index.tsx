import { MantineProvider } from '@mantine/core';
import {
	defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps, MicroAppProvider,
} from '@nikkierp/ui/microApp';
import { ViewEngineRouter } from '@nikkierp/viewkit-mantine';
import React from 'react';

import { registerSettingsCommands } from './features/settings';
import { buildSettingsMenu } from './menu';
import { buildSettingsPages } from './pages/settings';
import { contributeSettingsViewKit } from './viewkit/kit';


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
 * The settings page is a compiled view-engine page like any other: the rail and the pane are
 * registered contributions of this module's own kit (`./viewkit`), and the page itself is plain
 * JSON metadata. Only the *contents* of the right pane belong to another module, and those
 * arrive through `LazyMicroWidget` rather than through this router.
 */
function MicroAppInner(props: MicroAppProps): React.ReactNode {
	const pages = React.useMemo(() => buildSettingsPages(), []);

	return (
		<ViewEngineRouter
			microAppProps={props}
			engineProps={{ pages }}
		/>
	);
}


const bundle: MicroAppBundle = {
	init({ htmlTag, slug, host }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, {
			htmlTag,
			domType,
		});

		// No `registerReducer`: that injects a slice into the *Shell's* store and is deprecated.
		// This module keeps its own request state in `./store`; the setting *values* belong to
		// the module that owns them.
		host.menuRegistry.register(buildSettingsMenu(slug));

		// The settings API, published for every module's settings pane. A pane runs inside its
		// own bundle and cannot import this module, so the bus is the only route.
		registerSettingsCommands(host.commandBus);

		contributeSettingsViewKit(host.viewEngine);

		return {
			domType,
		};
	},
};

export default bundle;
