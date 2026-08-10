import { defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps } from '@nikkierp/ui/microApp';
import { MicroAppProvider } from '@nikkierp/ui/microApp';
import React from 'react';

import { buildInventoryMenu } from './menu';


// The Products rewrite lands the view-engine pages in PROD-002-J. Until then the bundle mounts an
// empty shell: the legacy JSX router and its Redux state layer are gone, and nothing has replaced
// them yet.
function Main(props: MicroAppProps) {
	return (
		<MicroAppProvider {...props}>
			<h1>Inventory</h1>
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

		host.menuRegistry.register(buildInventoryMenu(slug));

		return {
			domType,
		};
	},
};

export default bundle;
