import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { stockTransferService } from './stockTransferService';
import { INVENTORY_MODULE, STOCK_TRANSFER_SCHEMA_NAME } from '../../constants';


const PREFIX = `${INVENTORY_MODULE}.${STOCK_TRANSFER_SCHEMA_NAME}`;

/**
 * Command names for the stock transfer resource.
 *
 * The CRUD names come from the schema-driven generic path
 * (`core.resource.inventory_stock_transfer.*`), served by the Shell's single prefix subscription —
 * this module subscribes none of them.
 *
 * The six below are genuinely not CRUD. Each posts to its own endpoint with its own permission,
 * because they are materially different powers: validating a transfer moves real goods and cannot
 * be undone by an edit, while updating one changes a note.
 */
export const StockTransferCommands = Object.freeze({
	...resourceCommands(STOCK_TRANSFER_SCHEMA_NAME),
	CONFIRM: `${PREFIX}.confirm`,
	CHECK_AVAILABILITY: `${PREFIX}.check_availability`,
	RESERVE: `${PREFIX}.reserve`,
	UNRESERVE: `${PREFIX}.unreserve`,
	VALIDATE: `${PREFIX}.validate`,
	CANCEL: `${PREFIX}.cancel`,
	CREATE_RETURN: `${PREFIX}.create_return`,
} as const);

/**
 * Registers the transfer service and subscribes the six movement handlers. Called synchronously
 * during the micro-app `init` so lazy command resolution finds them.
 * Returns a function that unsubscribes every handler (for teardown).
 */
export function registerStockTransferCommands(bus: ICommandBus): () => void {
	registerSchemaModule(STOCK_TRANSFER_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(STOCK_TRANSFER_SCHEMA_NAME, stockTransferService);

	const unsubscribers = [
		bus.subscribe(StockTransferCommands.CONFIRM, cmd => stockTransferService.confirm(request(cmd))),
		bus.subscribe(
			StockTransferCommands.CHECK_AVAILABILITY,
			cmd => stockTransferService.checkAvailability(request(cmd)),
		),
		bus.subscribe(StockTransferCommands.RESERVE, cmd => stockTransferService.reserve(request(cmd))),
		bus.subscribe(StockTransferCommands.UNRESERVE, cmd => stockTransferService.unreserve(request(cmd))),
		bus.subscribe(StockTransferCommands.VALIDATE, cmd => stockTransferService.validate(request(cmd))),
		bus.subscribe(StockTransferCommands.CANCEL, cmd => stockTransferService.cancel(request(cmd))),
		bus.subscribe(
			StockTransferCommands.CREATE_RETURN,
			cmd => stockTransferService.createReturn(request(cmd)),
		),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

/**
 * The payload a contextual action publishes: the record's `{id, etag}`, plus whatever the action's
 * `prompt` collected. Extra keys travel straight into the POST body.
 *
 * Validate's `idempotency_key` and `create_backorder` still have no UI path, but that is now a
 * choice rather than a limitation: a prompt could carry `create_backorder`, and an idempotency key
 * should never be typed by a user — it is generated client-side, so wiring it belongs in the
 * command layer rather than in a dialog. Neither is in this phase's scope.
 *
 * `create_return` sends no payload at all, and defaults to the full returnable quantity per move.
 * The return lands as a draft, so a user who wants less edits its moves before confirming.
 */
function request(command: Command): dyn.RestMutateOneRequest {
	return command.payload as dyn.RestMutateOneRequest;
}
