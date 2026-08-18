import { schemaRegistry } from '@nikkierp/common/dynamicModel';
import { defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps } from '@nikkierp/ui/microApp';
import { MicroAppProvider } from '@nikkierp/ui/microApp';
import { ViewEngineRouter } from '@nikkierp/viewkit-mantine';
import React from 'react';

import * as c from './constants';
import { registerInvoiceCommands } from './features/invoice/commands';
import { registerInvoiceLineCommands } from './features/invoiceLine/commands';
import { registerOrderCommands } from './features/order/commands';
import { registerPaymentMethodCommands } from './features/paymentMethod/commands';
import { registerTransactionCommands } from './features/transaction/commands';
import { buildPaymentInvoiceMenu } from './menu';
import { buildInvoicePages } from './pages/invoice';
import { buildOrderPages } from './pages/order';
import { buildTransactionPages } from './pages/transaction';


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

		// No `registerReducer`: this module keeps its state in its own store (`./store`), and
		// reaches the Shell only through the command and event buses.
		registerModelSchemas();
		host.menuRegistry.register(buildPaymentInvoiceMenu(slug));
		// Payment method first: an order and a transaction both point at one, so its schema must
		// be registered before anything resolves a relation onto it.
		registerPaymentMethodCommands(host.commandBus);
		registerOrderCommands(host.commandBus);
		registerTransactionCommands(host.commandBus);
		registerInvoiceCommands(host.commandBus);
		registerInvoiceLineCommands(host.commandBus);

		return {
			domType,
		};
	},
};

export default bundle;

function MicroAppInner(props: MicroAppProps): React.ReactNode {
	const pages = React.useMemo(() => [
		...buildOrderPages(),
		...buildTransactionPages(),
		...buildInvoicePages(),
	], []);

	return (
		<ViewEngineRouter
			microAppProps={props}
			engineProps={{ pages, indexElement: <h1>Payment &amp; Invoice</h1> }}
		/>
	);
}

/**
 * All five schemas are registered, including the two with no page of their own.
 *
 * A relation select resolves its target through this registry, so a payment method that is not
 * registered leaves the field on an order showing a raw ULID; an invoice line that is not
 * registered leaves the related-records table on an invoice unable to load at all.
 */
function registerModelSchemas(): void {
	schemaRegistry.register([{
		// No page of its own: a payment method is configuration, reached through the relation
		// select on an order rather than managed here.
		schemaName: c.PAYMENT_METHOD_SCHEMA_NAME,
		resourcePath: c.PAYMENT_METHOD_RESOURCE_PATH,
	}, {
		schemaName: c.ORDER_SCHEMA_NAME,
		resourcePath: c.ORDER_RESOURCE_PATH,
	}, {
		schemaName: c.TRANSACTION_SCHEMA_NAME,
		resourcePath: c.TRANSACTION_RESOURCE_PATH,
	}, {
		schemaName: c.INVOICE_SCHEMA_NAME,
		resourcePath: c.INVOICE_RESOURCE_PATH,
	}, {
		// Reached as a related record of the invoice that owns it: a line has no life outside it.
		schemaName: c.INVOICE_LINE_SCHEMA_NAME,
		resourcePath: c.INVOICE_LINE_RESOURCE_PATH,
	}]);
}
