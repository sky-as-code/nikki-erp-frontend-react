import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { PricelistActionRequest, salesPricelistService } from './salesPricelistService';
import { SALES_MODULE, SALES_PRICELIST_SCHEMA_NAME } from '../../constants';


const PREFIX = `${SALES_MODULE}.${SALES_PRICELIST_SCHEMA_NAME}`;

export const SalesPricelistCommands = Object.freeze({
	...resourceCommands(SALES_PRICELIST_SCHEMA_NAME),
	SET_DEFAULT: `${PREFIX}.set_default`,
} as const);

export function registerSalesPricelistCommands(bus: ICommandBus): () => void {
	registerSchemaModule(SALES_PRICELIST_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_PRICELIST_SCHEMA_NAME, salesPricelistService);

	const unsubscribers = [
		bus.subscribe(
			SalesPricelistCommands.SET_DEFAULT,
			cmd => salesPricelistService.setDefault(actionRequest(cmd)),
		),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function actionRequest(command: Command): PricelistActionRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		id: String(payload.id ?? ''),
		etag: payload.etag == null ? undefined : String(payload.etag),
	};
}
