import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { productVariantService } from './productVariantService';
import { INVENTORY_MODULE, PRODUCT_VARIANT_SCHEMA_NAME } from '../../constants';


const PREFIX = `${INVENTORY_MODULE}.${PRODUCT_VARIANT_SCHEMA_NAME}`;

/**
 * Command names for the product variant resource.
 *
 * The CRUD names come from the schema-driven generic path
 * (`core.resource.inventory_product_variant.*`) served by the Shell's single prefix subscription.
 *
 * `GET_EFFECTIVE` is the cross-module entry point: a consumer that needs a product reads the
 * flattened result rather than joining the template and variant itself. See AC-PROD-032.
 */
export const ProductVariantCommands = Object.freeze({
	...resourceCommands(PRODUCT_VARIANT_SCHEMA_NAME),
	GET_EFFECTIVE: `${PREFIX}.get_effective`,
} as const);

/**
 * Registers the product variant service and subscribes the non-CRUD handler. Called synchronously
 * during the micro-app `init` so the service is in place before any generic command is served.
 * Returns a function that unsubscribes every handler (for teardown).
 */
export function registerProductVariantCommands(bus: ICommandBus): () => void {
	registerSchemaModule(PRODUCT_VARIANT_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(PRODUCT_VARIANT_SCHEMA_NAME, productVariantService);

	const unsubscribers = [
		bus.subscribe(
			ProductVariantCommands.GET_EFFECTIVE,
			cmd => productVariantService.getEffectiveProduct(payload<{ id: string }>(cmd).id),
		),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function payload<TPayload>(command: Command): TPayload {
	return command.payload as TPayload;
}
