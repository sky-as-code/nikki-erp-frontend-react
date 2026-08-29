import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import {
	ChannelActionRequest, ChannelPaymentMethodRequest, ResolveChannelRequest, salesChannelService,
} from './salesChannelService';
import { SALES_CHANNEL_SCHEMA_NAME, SALES_MODULE } from '../../constants';


const PREFIX = `${SALES_MODULE}.${SALES_CHANNEL_SCHEMA_NAME}`;

export const SalesChannelCommands = Object.freeze({
	...resourceCommands(SALES_CHANNEL_SCHEMA_NAME),
	SUSPEND: `${PREFIX}.suspend`,
	ACTIVATE: `${PREFIX}.activate`,
	ARCHIVE: `${PREFIX}.archive`,
	RESOLVE: `${PREFIX}.resolve`,
	PAYMENT_METHODS: `${PREFIX}.payment_methods`,
	ENABLE_PAYMENT_METHOD: `${PREFIX}.enable_payment_method`,
	DISABLE_PAYMENT_METHOD: `${PREFIX}.disable_payment_method`,
} as const);

export function registerSalesChannelCommands(bus: ICommandBus): () => void {
	registerSchemaModule(SALES_CHANNEL_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_CHANNEL_SCHEMA_NAME, salesChannelService);

	const unsubscribers = [
		bus.subscribe(
			SalesChannelCommands.SUSPEND,
			cmd => salesChannelService.suspend(actionRequest(cmd)),
		),
		bus.subscribe(
			SalesChannelCommands.ACTIVATE,
			cmd => salesChannelService.activate(actionRequest(cmd)),
		),
		bus.subscribe(
			SalesChannelCommands.ARCHIVE,
			cmd => salesChannelService.archive(actionRequest(cmd)),
		),
		bus.subscribe(
			SalesChannelCommands.RESOLVE,
			cmd => salesChannelService.resolve(resolveRequest(cmd)),
		),
		bus.subscribe(
			SalesChannelCommands.PAYMENT_METHODS,
			cmd => salesChannelService.paymentMethods(actionRequest(cmd)),
		),
		bus.subscribe(
			SalesChannelCommands.ENABLE_PAYMENT_METHOD,
			cmd => salesChannelService.enablePaymentMethod(paymentMethodRequest(cmd)),
		),
		bus.subscribe(
			SalesChannelCommands.DISABLE_PAYMENT_METHOD,
			cmd => salesChannelService.disablePaymentMethod(paymentMethodRequest(cmd)),
		),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function actionRequest(command: Command): ChannelActionRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		id: String(payload.id ?? ''),
		etag: payload.etag == null ? undefined : String(payload.etag),
	};
}

/** Collection-level: takes the code rather than an id. */
function resolveRequest(command: Command): ResolveChannelRequest {
	const payload = command.payload as Record<string, unknown>;
	return { code: String(payload.code ?? '') };
}

/**
 * Both ids are required; the backend returns 400 for a missing one rather than reading an absent
 * method as "all of them".
 */
function paymentMethodRequest(command: Command): ChannelPaymentMethodRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		...actionRequest(command),
		payment_method_id: String(payload.payment_method_id ?? ''),
	};
}
