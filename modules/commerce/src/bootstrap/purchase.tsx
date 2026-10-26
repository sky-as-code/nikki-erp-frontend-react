import { schemaRegistry } from '@nikkierp/common/dynamicModel';

import * as c from '../constants/purchase';
import { registerAgreementCommands } from '../features/purchase/agreement/commands';
import { registerAgreementLineCommands } from '../features/purchase/agreementLine/commands';
import { registerAuditEventCommands } from '../features/purchase/auditEvent/commands';
import { registerConfigurationCommands } from '../features/purchase/configuration/commands';
import { registerPurchaseOrderCommands } from '../features/purchase/purchaseOrder/commands';
import { registerPurchaseOrderLineCommands } from '../features/purchase/purchaseOrderLine/commands';
import { registerVendorProductPriceCommands } from '../features/purchase/vendorProductPrice/commands';
import { buildAgreementPages } from '../pages/purchase/agreement';
import { buildConfigurationPages } from '../pages/purchase/configuration';
import { buildPurchaseOrderPages } from '../pages/purchase/purchaseOrder';
import { buildVendorProductPricePages } from '../pages/purchase/vendorProductPrice';

import type { HostServices } from '@nikkierp/ui/microApp';
import type { PageNode } from '@nikkierp/viewengine/metadata';


/** Everything `purchase` contributes to the host when the commerce bundle initialises. */
export function registerPurchase(host: HostServices): void {
	// No `registerReducer`: this module keeps its state in its own store (`../store/purchase`), and
	// reaches the Shell only through the command and event buses.
	registerModelSchemas();
	// Configuration first: it is read on every order confirmation, and registering it before
	// the documents that consult it keeps this list in the same order as `registerModelSchemas`
	// — referenced before referencing — which makes a missing entry obvious side by side.
	registerConfigurationCommands(host.commandBus);
	// Vendor prices before the documents that resolve through them, same rule as configuration:
	// a purchase order line records which quote it was priced from.
	registerVendorProductPriceCommands(host.commandBus);
	registerAgreementCommands(host.commandBus);
	registerAgreementLineCommands(host.commandBus);
	registerPurchaseOrderCommands(host.commandBus);
	registerPurchaseOrderLineCommands(host.commandBus);
	registerAuditEventCommands(host.commandBus);
}

export function buildPurchasePages(): PageNode[] {
	// `buildPurchaseOrderPages` returns TWO pages, not one: requests for quotation and committed
	// orders are two routes onto the same resource, distinguished by a status filter (PUR-R1).
	return [
		...buildPurchaseOrderPages(),
		...buildAgreementPages(),
		...buildConfigurationPages(),
		...buildVendorProductPricePages(),
	];
}

/**
 * All seven schemas are registered, including the four with no page of their own.
 *
 * A relation select resolves its target through this registry, so an agreement that is not
 * registered leaves the field on an order showing a raw ULID; an order line that is not registered
 * leaves the related-records table on an order unable to load at all.
 */
function registerModelSchemas(): void {
	schemaRegistry.register([{
		// One record per organization, holding the approval mode and threshold.
		schemaName: c.CONFIGURATION_SCHEMA_NAME,
		resourcePath: c.CONFIGURATION_RESOURCE_PATH,
	}, {
		// What each vendor offers a product at. Registered before the order line, which records
		// which quote it resolved through.
		schemaName: c.VENDOR_PRODUCT_PRICE_SCHEMA_NAME,
		resourcePath: c.VENDOR_PRODUCT_PRICE_RESOURCE_PATH,
	}, {
		// No page of its own: a sourcing group is created by adding an alternative to an order and
		// reaped when fewer than two remain (§28), so a hand-made one would be an empty container
		// that nothing reaps. Registered so the alternatives table on an order can resolve it.
		schemaName: c.SOURCING_GROUP_SCHEMA_NAME,
		resourcePath: c.SOURCING_GROUP_RESOURCE_PATH,
	}, {
		schemaName: c.AGREEMENT_SCHEMA_NAME,
		resourcePath: c.AGREEMENT_RESOURCE_PATH,
	}, {
		// Reached as a related record of the agreement that owns it: a line has no life outside it.
		schemaName: c.AGREEMENT_LINE_SCHEMA_NAME,
		resourcePath: c.AGREEMENT_LINE_RESOURCE_PATH,
	}, {
		schemaName: c.PURCHASE_ORDER_SCHEMA_NAME,
		resourcePath: c.PURCHASE_ORDER_RESOURCE_PATH,
	}, {
		schemaName: c.PURCHASE_ORDER_LINE_SCHEMA_NAME,
		resourcePath: c.PURCHASE_ORDER_LINE_RESOURCE_PATH,
	}, {
		// Read-only by design (PUR-R6): the backend refuses a client write, so this is registered
		// to be listed on a document's history, never to be created from here.
		schemaName: c.AUDIT_EVENT_SCHEMA_NAME,
		resourcePath: c.AUDIT_EVENT_RESOURCE_PATH,
	}]);
}
