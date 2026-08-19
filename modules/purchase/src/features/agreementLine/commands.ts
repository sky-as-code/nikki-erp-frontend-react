import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { agreementLineService } from './agreementLineService';
import { AGREEMENT_LINE_SCHEMA_NAME, PURCHASE_MODULE } from '../../constants';


/**
 * Command names for this resource, all from the schema-driven generic path
 * (`core.resource.purchase_agreement_line.*`) served by the Shell's single prefix subscription.
 */
export const AgreementLineCommands = Object.freeze(resourceCommands(AGREEMENT_LINE_SCHEMA_NAME));

/**
 * Registers the service. Called synchronously during the micro-app `init` so it is in place
 * before any generic command is served.
 */
export function registerAgreementLineCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(AGREEMENT_LINE_SCHEMA_NAME, PURCHASE_MODULE);
	registerCrudService(AGREEMENT_LINE_SCHEMA_NAME, agreementLineService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
