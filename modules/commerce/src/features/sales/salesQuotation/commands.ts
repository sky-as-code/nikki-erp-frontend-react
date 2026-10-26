import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import {
	ConvertQuotationRequest, QuotationActionRequest, salesQuotationService,
} from './salesQuotationService';
import { SALES_MODULE, SALES_QUOTATION_SCHEMA_NAME } from '../../constants';


const PREFIX = `${SALES_MODULE}.${SALES_QUOTATION_SCHEMA_NAME}`;

export const SalesQuotationCommands = Object.freeze({
	...resourceCommands(SALES_QUOTATION_SCHEMA_NAME),
	CONVERT: `${PREFIX}.convert`,
	SEND: `${PREFIX}.send`,
	CANCEL: `${PREFIX}.cancel`,
} as const);

export function registerSalesQuotationCommands(bus: ICommandBus): () => void {
	registerSchemaModule(SALES_QUOTATION_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_QUOTATION_SCHEMA_NAME, salesQuotationService);

	const unsubscribers = [
		bus.subscribe(
			SalesQuotationCommands.CONVERT,
			cmd => salesQuotationService.convert(convertRequest(cmd)),
		),
		bus.subscribe(
			SalesQuotationCommands.SEND,
			cmd => salesQuotationService.send(actionRequest(cmd)),
		),
		bus.subscribe(
			SalesQuotationCommands.CANCEL,
			cmd => salesQuotationService.cancel(actionRequest(cmd)),
		),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function actionRequest(command: Command): QuotationActionRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		id: String(payload.id ?? ''),
		etag: payload.etag == null ? undefined : String(payload.etag),
	};
}

/**
 * A prompt can collect `sales_point_id` because it is a field of the quotation schema; a prompt
 * narrows the page's own schema and drops names it does not declare.
 */
function convertRequest(command: Command): ConvertQuotationRequest {
	const payload = command.payload as Record<string, unknown>;
	const key = payload.idempotency_key;
	return {
		...actionRequest(command),
		sales_point_id: String(payload.sales_point_id ?? ''),
		idempotency_key: key == null || key === '' ? undefined : String(key),
	};
}
