import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { ReleaseReservationRequest, stockReservationService } from './stockReservationService';
import { INVENTORY_MODULE, STOCK_RESERVATION_SCHEMA_NAME } from '../../constants';


const PREFIX = `${INVENTORY_MODULE}.${STOCK_RESERVATION_SCHEMA_NAME}`;

/**
 * The CRUD names come from the schema-driven generic path; only the reads are served for this
 * resource. `release` is the one operation offered on the page; reserve and consume are reached
 * by the selling module and the kiosk through their ports, not by a user.
 */
export const StockReservationCommands = Object.freeze({
	...resourceCommands(STOCK_RESERVATION_SCHEMA_NAME),
	RELEASE: `${PREFIX}.release`,
} as const);

/** Must run synchronously during the micro-app `init` so lazy command resolution finds it. */
export function registerStockReservationCommands(bus: ICommandBus): () => void {
	registerSchemaModule(STOCK_RESERVATION_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(STOCK_RESERVATION_SCHEMA_NAME, stockReservationService);

	const unsubscribers = [
		bus.subscribe(StockReservationCommands.RELEASE, cmd => stockReservationService.release(releaseRequest(cmd))),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

/**
 * The prompt collects `release_reason`, a field of the reservation's own schema, which is the one
 * kind a prompt can collect; the backend action reads it as `reason`.
 */
function releaseRequest(command: Command): ReleaseReservationRequest {
	const payload = command.payload as Record<string, unknown>;
	const reason = payload.reason ?? payload.release_reason;
	return {
		id: String(payload.id ?? ''),
		etag: payload.etag == null ? undefined : String(payload.etag),
		reason: reason == null || reason === '' ? undefined : String(reason),
	};
}
