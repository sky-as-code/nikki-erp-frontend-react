import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { warehouseService } from './warehouseService';
import { INVENTORY_MODULE, WAREHOUSE_SCHEMA_NAME } from '../../constants';


const PREFIX = `${INVENTORY_MODULE}.${WAREHOUSE_SCHEMA_NAME}`;

/**
 * Command names for the warehouse resource.
 *
 * The CRUD names come from the schema-driven generic path
 * (`core.resource.inventory_warehouse.*`), served by the Shell's single prefix subscription — this
 * module subscribes none of them.
 *
 * The four below are not CRUD. Suspending closes a warehouse temporarily while archiving withdraws
 * it, and reconfiguring a flow provisions locations; none of them is an edit to a field, and each
 * carries its own permission.
 *
 * There is deliberately no activate or deactivate: suspension is the reversible state and
 * archiving is the withdrawal, so a third pair of verbs would only drift apart from them.
 */
export const WarehouseCommands = Object.freeze({
	...resourceCommands(WAREHOUSE_SCHEMA_NAME),
	SUSPEND: `${PREFIX}.suspend`,
	RESUME: `${PREFIX}.resume`,
	CONFIGURE_INCOMING_FLOW: `${PREFIX}.configure_incoming_flow`,
	CONFIGURE_OUTGOING_FLOW: `${PREFIX}.configure_outgoing_flow`,
} as const);

/**
 * Registers the warehouse service and subscribes the four lifecycle handlers. Called
 * synchronously during the micro-app `init` so lazy command resolution finds them.
 * Returns a function that unsubscribes every handler (for teardown).
 */
export function registerWarehouseCommands(bus: ICommandBus): () => void {
	registerSchemaModule(WAREHOUSE_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(WAREHOUSE_SCHEMA_NAME, warehouseService);

	const unsubscribers = [
		bus.subscribe(WarehouseCommands.SUSPEND, cmd => warehouseService.suspend(request(cmd))),
		bus.subscribe(WarehouseCommands.RESUME, cmd => warehouseService.resume(request(cmd))),
		bus.subscribe(
			WarehouseCommands.CONFIGURE_INCOMING_FLOW,
			cmd => warehouseService.configureIncomingFlow(request(cmd)),
		),
		bus.subscribe(
			WarehouseCommands.CONFIGURE_OUTGOING_FLOW,
			cmd => warehouseService.configureOutgoingFlow(request(cmd)),
		),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

/**
 * The payload a contextual action publishes: the record's `{id, etag}`, plus whatever the action's
 * `prompt` collected. Extra keys travel straight into the POST body, which is how the flow actions
 * receive their `flow`.
 */
function request(cmd: Command): dyn.RestMutateOneRequest {
	return (cmd.payload ?? {}) as dyn.RestMutateOneRequest;
}
