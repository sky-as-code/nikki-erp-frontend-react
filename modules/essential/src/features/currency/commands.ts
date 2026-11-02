import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { currencyService } from './currencyService';
import { CURRENCY_SCHEMA_NAME, ESSENTIAL_MODULE } from '../../constants';

import type { ICommandBus } from '@nikkierp/common/commandBus';


/**
 * Command names for the currency catalogue, all from the generic schema-driven path. Accounting's
 * settings pane searches currencies through the same `SEARCH` name, as a literal.
 */
export const CurrencyCommands = Object.freeze({
	...resourceCommands(CURRENCY_SCHEMA_NAME),
} as const);

export function registerCurrencyCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(CURRENCY_SCHEMA_NAME, ESSENTIAL_MODULE);
	registerCrudService(CURRENCY_SCHEMA_NAME, currencyService);

	return () => { /* nothing subscribed, so nothing to unsubscribe */ };
}
