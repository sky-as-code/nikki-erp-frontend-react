import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { stockScrapService } from './stockScrapService';
import { INVENTORY_MODULE, STOCK_SCRAP_SCHEMA_NAME } from '../../constants';


const PREFIX = `${INVENTORY_MODULE}.${STOCK_SCRAP_SCHEMA_NAME}`;

/**
 * Command names for the stock scrap resource.
 *
 * The CRUD names come from the schema-driven generic path
 * (`core.resource.inventory_stock_scrap.*`), served by the Shell's single prefix subscription —
 * this module subscribes none of them.
 *
 * `do_scrap` is not CRUD: it posts to its own endpoint with its own permission, because
 * destroying stock is a materially different power from correcting a note on the document.
 */
export const StockScrapCommands = Object.freeze({
	...resourceCommands(STOCK_SCRAP_SCHEMA_NAME),
	DO_SCRAP: `${PREFIX}.do_scrap`,
} as const);

/**
 * Registers the scrap service and subscribes Do Scrap. Called synchronously during the micro-app
 * `init` so lazy command resolution finds it.
 * Returns a function that unsubscribes every handler (for teardown).
 */
export function registerStockScrapCommands(bus: ICommandBus): () => void {
	registerSchemaModule(STOCK_SCRAP_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(STOCK_SCRAP_SCHEMA_NAME, stockScrapService);

	const unsubscribers = [
		bus.subscribe(StockScrapCommands.DO_SCRAP, cmd => stockScrapService.doScrap(request(cmd))),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

/** Do Scrap needs nothing beyond the record it acts on, so `{id, etag}` is the whole payload. */
function request(command: Command): dyn.RestMutateOneRequest {
	return command.payload as dyn.RestMutateOneRequest;
}
