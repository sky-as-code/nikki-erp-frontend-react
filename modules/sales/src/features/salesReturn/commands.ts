import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { ConfirmReturnRequest, ReturnActionRequest, salesReturnService } from './salesReturnService';
import { SALES_MODULE, SALES_RETURN_SCHEMA_NAME } from '../../constants';


const PREFIX = `${SALES_MODULE}.${SALES_RETURN_SCHEMA_NAME}`;

/**
 * The CRUD names come from the schema-driven generic path; the three below are the lifecycle
 * actions, each with its own backend permission.
 */
export const SalesReturnCommands = Object.freeze({
	...resourceCommands(SALES_RETURN_SCHEMA_NAME),
	CONFIRM: `${PREFIX}.confirm`,
	PROCESS: `${PREFIX}.process`,
	CANCEL: `${PREFIX}.cancel`,
} as const);

/** Must run synchronously during the micro-app `init` so lazy command resolution finds the handlers. */
export function registerSalesReturnCommands(bus: ICommandBus): () => void {
	registerSchemaModule(SALES_RETURN_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_RETURN_SCHEMA_NAME, salesReturnService);

	const unsubscribers = [
		bus.subscribe(SalesReturnCommands.CONFIRM, cmd => salesReturnService.confirm(confirmRequest(cmd))),
		bus.subscribe(SalesReturnCommands.PROCESS, cmd => salesReturnService.process(actionRequest(cmd))),
		bus.subscribe(SalesReturnCommands.CANCEL, cmd => salesReturnService.cancel({
			...actionRequest(cmd),
			reason: String((cmd.payload as Record<string, unknown>).reason ?? ''),
		})),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function actionRequest(command: Command): ReturnActionRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		id: String(payload.id ?? ''),
		etag: payload.etag == null ? undefined : String(payload.etag),
	};
}

/**
 * The prompt collects `confirmation_note`, a field of the return's own schema, which is the only
 * kind a prompt can collect; the backend action reads it as `refund_note`.
 */
function confirmRequest(command: Command): ConfirmReturnRequest {
	const payload = command.payload as Record<string, unknown>;
	const note = payload.refund_note ?? payload.confirmation_note;
	return {
		...actionRequest(command),
		refund_note: note == null || note === '' ? undefined : String(note),
	};
}
