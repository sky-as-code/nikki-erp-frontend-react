import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { vendorProductPriceService } from './vendorProductPriceService';
import { PURCHASE_MODULE, VENDOR_PRODUCT_PRICE_SCHEMA_NAME } from '../../constants';


/**
 * Command names for this resource, all from the schema-driven generic path
 * (`core.resource.purchase_vendor_product_price.*`) served by the Shell's single prefix
 * subscription.
 *
 * Because these names are derived from the schema string alone, the Inventory product page can
 * name this resource's SEARCH command without importing anything from here — which it has to, since
 * a module may not import another module.
 */
export const VendorProductPriceCommands = Object.freeze(
	resourceCommands(VENDOR_PRODUCT_PRICE_SCHEMA_NAME),
);

/**
 * Registers the service. Called synchronously during the micro-app `init` so it is in place
 * before any generic command is served.
 */
export function registerVendorProductPriceCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(VENDOR_PRODUCT_PRICE_SCHEMA_NAME, PURCHASE_MODULE);
	registerCrudService(VENDOR_PRODUCT_PRICE_SCHEMA_NAME, vendorProductPriceService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
