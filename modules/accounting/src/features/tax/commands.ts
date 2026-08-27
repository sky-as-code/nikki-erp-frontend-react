import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { TaxCalculationRequest, taxService } from './taxService';
import { ACCOUNTING_MODULE, TAX_SCHEMA_NAME } from '../../constants';


const PREFIX = `${ACCOUNTING_MODULE}.${TAX_SCHEMA_NAME}`;

/**
 * Command names for `accounting_tax`.
 *
 * The CRUD names come from the schema-driven generic path (`core.resource.accounting_tax.*`),
 * served by the Shell's single prefix subscription — this module subscribes none of them.
 *
 * The two below are genuinely not CRUD: they price a document rather than mutate a tax, and each
 * carries its own permission on the backend.
 */
export const TaxCommands = Object.freeze({
	...resourceCommands(TAX_SCHEMA_NAME),
	CALCULATE: `${PREFIX}.calculate`,
	SIMULATE: `${PREFIX}.simulate`,
} as const);

/**
 * Registers the tax service and subscribes its two engine handlers. Called synchronously during
 * the micro-app `init` so lazy command resolution finds them.
 * Returns a function that unsubscribes every handler (for teardown).
 */
export function registerTaxCommands(bus: ICommandBus): () => void {
	registerSchemaModule(TAX_SCHEMA_NAME, ACCOUNTING_MODULE);
	registerCrudService(TAX_SCHEMA_NAME, taxService);

	const unsubscribers = [
		bus.subscribe(
			TaxCommands.CALCULATE,
			cmd => taxService.calculate(calculationRequest(cmd)),
		),
		bus.subscribe(
			TaxCommands.SIMULATE,
			cmd => taxService.simulate(calculationRequest(cmd)),
		),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

/**
 * The document a caller asks to have priced.
 *
 * Passed through rather than reshaped: the payload is already the request contract, and every
 * money field in it is a string that must reach the backend unparsed. Coercing anything here is
 * how a decimal becomes a float.
 */
function calculationRequest(command: Command): TaxCalculationRequest {
	return command.payload as TaxCalculationRequest;
}
