import { MenuIndexRedirect } from '@nikkierp/ui/menu';
import { defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps } from '@nikkierp/ui/microApp';
import { MicroAppProvider } from '@nikkierp/ui/microApp';
import { ViewEngineRouter } from '@nikkierp/viewkit-mantine';
import React from 'react';

import { buildInventoryPages, registerInventory } from './bootstrap/inventory';
import { buildPurchasePages, registerPurchase } from './bootstrap/purchase';
import { buildSalesPages, registerSales } from './bootstrap/sales';
import { buildCommerceMenu } from './menu';


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

		host.menuRegistry.register(buildCommerceMenu(slug));
		// Inventory first: purchase and sales documents reference its products and warehouses,
		// and each sub-module already registers its own schemas referenced-before-referencing.
		registerInventory(host);
		registerPurchase(host);
		registerSales(host);

		return {
			domType,
		};
	},
};

export default bundle;

function MicroAppInner(props: MicroAppProps): React.ReactNode {
	const pages = React.useMemo(() => [
		...buildInventoryPages(),
		...buildPurchasePages(),
		...buildSalesPages(),
	], []);

	const indexElement = <MenuIndexRedirect items={buildCommerceMenu(props.slug).items} />;

	return (
		<ViewEngineRouter
			microAppProps={props}
			engineProps={{ pages, indexElement }}
		/>
	);
}
