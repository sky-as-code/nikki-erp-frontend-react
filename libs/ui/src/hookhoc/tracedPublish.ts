import { recordSpanError, traceOperation } from '@nikkierp/common';

import type { TelemetryOperation } from '@nikkierp/common';
import type { Command, CommandBusResponse, ICommandBus } from '@nikkierp/common/commandBus';


type Publisher = Pick<ICommandBus, 'publish'>;

/**
 * Publishes `command` as one user operation named `operationName` (a fixed `UI_OPERATIONS` name), so every
 * request the command makes is a child of that operation's span. With no name, a plain publish.
 */
export function publishTraced<TData = unknown>(
	bus: Publisher, command: Command, operationName?: string,
): Promise<CommandBusResponse<TData>> {
	if (!operationName) return bus.publish<TData>(command);
	return traceOperation(operationName, operation => publishInOperation<TData>(bus, command, operation));
}

/**
 * Publishes `command` on behalf of an open `operation`, e.g. one of several parallel commands of one screen
 * load. The bus reports a technical failure as a value, never a throw, so it is marked on the operation here.
 */
export async function publishInOperation<TData = unknown>(
	bus: Publisher, command: Command, operation: TelemetryOperation,
): Promise<CommandBusResponse<TData>> {
	const response = await bus.publish<TData>({ ...command, operation });
	if (response.error != null) recordSpanError(operation.span, response.error);
	return response;
}
