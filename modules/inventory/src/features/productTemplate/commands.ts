import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { productTemplateService } from './productTemplateService';
import * as t from './types';
import { INVENTORY_MODULE, PRODUCT_TEMPLATE_SCHEMA_NAME } from '../../constants';


const PREFIX = `${INVENTORY_MODULE}.${PRODUCT_TEMPLATE_SCHEMA_NAME}`;

/**
 * Command names for the product template resource.
 *
 * The CRUD names come from the schema-driven generic path
 * (`core.resource.inventory_product_template.*`), served by the Shell's single prefix
 * subscription — this module subscribes none of them. `productTemplateService` stays reachable
 * through them because `registerCrudService` below hands it to that handler.
 *
 * The remaining two are the engine's custom actions, which the generic path cannot express.
 */
export const ProductTemplateCommands = Object.freeze({
	...resourceCommands(PRODUCT_TEMPLATE_SCHEMA_NAME),
	GENERATE_VARIANTS: `${PREFIX}.generate_variants`,
	RESOLVE_SELECTION: `${PREFIX}.resolve_selection`,
} as const);

/**
 * Registers the product template service and subscribes the non-CRUD handlers. Called
 * synchronously during the micro-app `init` so the service is in place before any generic command
 * is served. Returns a function that unsubscribes every handler (for teardown).
 */
export function registerProductTemplateCommands(bus: ICommandBus): () => void {
	registerSchemaModule(PRODUCT_TEMPLATE_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(PRODUCT_TEMPLATE_SCHEMA_NAME, productTemplateService);

	const unsubscribers = [
		bus.subscribe(
			ProductTemplateCommands.GENERATE_VARIANTS,
			cmd => productTemplateService.generateVariants(payload<{ id: string }>(cmd).id),
		),
		bus.subscribe(
			ProductTemplateCommands.RESOLVE_SELECTION,
			cmd => productTemplateService.resolveSelection(payload<t.ResolveSelectionRequest>(cmd)),
		),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function payload<TPayload>(command: Command): TPayload {
	return command.payload as TPayload;
}
