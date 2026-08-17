import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { stockQuantService } from './stockQuantService';
import { INVENTORY_MODULE, STOCK_QUANT_SCHEMA_NAME } from '../../constants';


const PREFIX = `${INVENTORY_MODULE}.${STOCK_QUANT_SCHEMA_NAME}`;

/**
 * Command names for the stock balance resource.
 *
 * The CRUD names come from the schema-driven generic path
 * (`core.resource.inventory_stock_quant.*`) served by the Shell's single prefix subscription. The
 * write ones among them exist because `resourceCommands` generates the full set from the schema
 * name, but the backend refuses them and no page binds them to an action.
 *
 * The five below are genuinely not CRUD. They are the counting operations of BR §4.2.7 and §4.2.8,
 * each posting to its own endpoint with its own permission — a warehouse hand records what they
 * counted, and a supervisor decides that the count becomes the balance.
 */
export const StockQuantCommands = Object.freeze({
	...resourceCommands(STOCK_QUANT_SCHEMA_NAME),
	ENTER_COUNT: `${PREFIX}.enter_count`,
	RESET_COUNT: `${PREFIX}.reset_count`,
	APPLY_ADJUSTMENT: `${PREFIX}.apply_adjustment`,
	SCHEDULE_COUNT: `${PREFIX}.schedule_count`,
	ASSIGN_COUNTER: `${PREFIX}.assign_counter`,
} as const);

/**
 * Registers the stock balance service and subscribes the five counting handlers. Called
 * synchronously during the micro-app `init` so lazy command resolution finds them.
 * Returns a function that unsubscribes every handler (for teardown).
 */
export function registerStockQuantCommands(bus: ICommandBus): () => void {
	registerSchemaModule(STOCK_QUANT_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(STOCK_QUANT_SCHEMA_NAME, stockQuantService);

	const unsubscribers = [
		bus.subscribe(StockQuantCommands.ENTER_COUNT, cmd => stockQuantService.enterCount(request(cmd))),
		bus.subscribe(StockQuantCommands.RESET_COUNT, cmd => stockQuantService.resetCount(request(cmd))),
		bus.subscribe(
			StockQuantCommands.APPLY_ADJUSTMENT,
			cmd => stockQuantService.applyAdjustment(request(cmd)),
		),
		bus.subscribe(StockQuantCommands.SCHEDULE_COUNT, cmd => stockQuantService.scheduleCount(request(cmd))),
		bus.subscribe(StockQuantCommands.ASSIGN_COUNTER, cmd => stockQuantService.assignCounter(request(cmd))),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

/**
 * The payload a contextual action publishes: `{id, etag}`, plus whatever a prompt collected.
 *
 * `enter_count` is the reason the prompt exists — it needs a counted quantity, which no
 * payload-free button could supply. The rest carry nothing beyond the record they act on.
 */
function request(command: Command): dyn.RestMutateOneRequest {
	return command.payload as dyn.RestMutateOneRequest;
}
