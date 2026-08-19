import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { CreatePaymentRequest, orderService, RefundRequest } from './orderService';
import { ORDER_SCHEMA_NAME, PAYMENTINVOICE_MODULE } from '../../constants';


const PREFIX = `${PAYMENTINVOICE_MODULE}.${ORDER_SCHEMA_NAME}`;

/**
 * Command names for the order resource.
 *
 * The CRUD names come from the schema-driven generic path
 * (`core.resource.paymentinvoice_order.*`), served by the Shell's single prefix subscription —
 * this module subscribes none of them.
 *
 * The two below are genuinely not CRUD, and each carries its own permission on the backend.
 */
export const OrderCommands = Object.freeze({
	...resourceCommands(ORDER_SCHEMA_NAME),
	CREATE_PAYMENT: `${PREFIX}.create_payment`,
	REFUND: `${PREFIX}.refund`,
} as const);

/**
 * Registers the order service and subscribes the two money handlers. Called synchronously during
 * the micro-app `init` so lazy command resolution finds them.
 * Returns a function that unsubscribes every handler (for teardown).
 */
export function registerOrderCommands(bus: ICommandBus): () => void {
	registerSchemaModule(ORDER_SCHEMA_NAME, PAYMENTINVOICE_MODULE);
	registerCrudService(ORDER_SCHEMA_NAME, orderService);

	const unsubscribers = [
		bus.subscribe(
			OrderCommands.CREATE_PAYMENT,
			cmd => orderService.createPayment(cmd.payload as CreatePaymentRequest),
		),
		bus.subscribe(
			OrderCommands.REFUND,
			cmd => orderService.refund(refundRequest(cmd)),
		),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

/**
 * The payload the refund action publishes.
 *
 * A contextual action sends the record's `{id, etag}` plus whatever its prompt collected, but the
 * backend refund identifies its order by the business `order_id` — the identifier the ordering
 * system was given — and not by this module's primary key. The two are different strings, so the
 * record's `order_id` field is passed through and the primary key is dropped rather than being
 * sent under a name the backend would read as something else.
 */
function refundRequest(command: Command): RefundRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		order_id: String(payload.order_id ?? ''),
		amount: String(payload.amount ?? ''),
		content: payload.content == null ? undefined : String(payload.content),
	};
}
