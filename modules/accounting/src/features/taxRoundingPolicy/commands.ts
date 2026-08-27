import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { taxRoundingPolicyService } from './taxRoundingPolicyService';
import { ACCOUNTING_MODULE, TAX_ROUNDING_POLICY_SCHEMA_NAME } from '../../constants';

import type { ICommandBus } from '@nikkierp/common/commandBus';


/**
 * Command names for `accounting_tax_rounding_policy`.
 *
 * All of them come from the schema-driven generic path (`core.resource.accounting_tax_rounding_policy.*`),
 * served by the Shell's single prefix subscription — this module subscribes none of them.
 */
export const TaxRoundingPolicyCommands = Object.freeze({
	...resourceCommands(TAX_ROUNDING_POLICY_SCHEMA_NAME),
} as const);

/**
 * Registers the service so the Shell's generic CRUD handler can resolve it. Called synchronously
 * during the micro-app `init` so lazy command resolution finds it.
 * Returns a function that undoes the registration (for teardown).
 */
export function registerTaxRoundingPolicyCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(TAX_ROUNDING_POLICY_SCHEMA_NAME, ACCOUNTING_MODULE);
	registerCrudService(TAX_ROUNDING_POLICY_SCHEMA_NAME, taxRoundingPolicyService);

	return () => { /* nothing subscribed, so nothing to unsubscribe */ };
}
