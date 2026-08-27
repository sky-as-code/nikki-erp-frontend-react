import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { taxMappingLineService } from './taxMappingLineService';
import { ACCOUNTING_MODULE, TAX_MAPPING_LINE_SCHEMA_NAME } from '../../constants';

import type { ICommandBus } from '@nikkierp/common/commandBus';


/**
 * Command names for `accounting_tax_mapping_line`.
 *
 * All of them come from the schema-driven generic path (`core.resource.accounting_tax_mapping_line.*`),
 * served by the Shell's single prefix subscription — this module subscribes none of them.
 */
export const TaxMappingLineCommands = Object.freeze({
	...resourceCommands(TAX_MAPPING_LINE_SCHEMA_NAME),
} as const);

/**
 * Registers the service so the Shell's generic CRUD handler can resolve it. Called synchronously
 * during the micro-app `init` so lazy command resolution finds it.
 * Returns a function that undoes the registration (for teardown).
 */
export function registerTaxMappingLineCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(TAX_MAPPING_LINE_SCHEMA_NAME, ACCOUNTING_MODULE);
	registerCrudService(TAX_MAPPING_LINE_SCHEMA_NAME, taxMappingLineService);

	return () => { /* nothing subscribed, so nothing to unsubscribe */ };
}
