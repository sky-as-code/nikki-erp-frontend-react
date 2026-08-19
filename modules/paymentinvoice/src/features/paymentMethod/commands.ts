import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { paymentMethodService } from './paymentMethodService';
import { PAYMENT_METHOD_SCHEMA_NAME, PAYMENTINVOICE_MODULE } from '../../constants';


/**
 * Command names for the payment method resource, all from the schema-driven generic path
 * (`core.resource.paymentinvoice_payment_method.*`) served by the Shell's single prefix
 * subscription.
 */
export const PaymentMethodCommands = Object.freeze(resourceCommands(PAYMENT_METHOD_SCHEMA_NAME));

/**
 * Registers the payment method service. Called synchronously during the micro-app `init` so the
 * service is in place before any generic command is served.
 */
export function registerPaymentMethodCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(PAYMENT_METHOD_SCHEMA_NAME, PAYMENTINVOICE_MODULE);
	registerCrudService(PAYMENT_METHOD_SCHEMA_NAME, paymentMethodService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
