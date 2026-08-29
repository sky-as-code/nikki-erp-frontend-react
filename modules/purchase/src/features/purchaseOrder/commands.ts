import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import {
	CreateAlternativeRequest, MergeOrdersRequest, OrderActionRequest, purchaseOrderService,
	ReasonedActionRequest,
} from './purchaseOrderService';
import { PURCHASE_MODULE, PURCHASE_ORDER_SCHEMA_NAME } from '../../constants';


const PREFIX = `${PURCHASE_MODULE}.${PURCHASE_ORDER_SCHEMA_NAME}`;

/**
 * Command names for the purchase order resource.
 *
 * The CRUD names come from the schema-driven generic path (`core.resource.purchase_order.*`),
 * served by the Shell's single prefix subscription — this module subscribes none of them.
 *
 * The twelve below are genuinely not CRUD, and each carries its own permission on the backend.
 */
export const PurchaseOrderCommands = Object.freeze({
	...resourceCommands(PURCHASE_ORDER_SCHEMA_NAME),
	CONFIRM: `${PREFIX}.confirm`,
	APPROVE: `${PREFIX}.approve`,
	CANCEL: `${PREFIX}.cancel`,
	SEND: `${PREFIX}.send`,
	LOCK: `${PREFIX}.lock`,
	UNLOCK: `${PREFIX}.unlock`,
	ACKNOWLEDGE: `${PREFIX}.acknowledge`,
	DUPLICATE: `${PREFIX}.duplicate`,
	REPRICE: `${PREFIX}.reprice`,
	MERGE: `${PREFIX}.merge`,
	CREATE_ALTERNATIVE: `${PREFIX}.create_alternative`,
	COMPARE_ALTERNATIVES: `${PREFIX}.compare_alternatives`,
} as const);

/**
 * Registers the order service and subscribes the twelve lifecycle handlers. Called synchronously
 * during the micro-app `init` so lazy command resolution finds them.
 * Returns a function that unsubscribes every handler (for teardown).
 */
export function registerPurchaseOrderCommands(bus: ICommandBus): () => void {
	registerSchemaModule(PURCHASE_ORDER_SCHEMA_NAME, PURCHASE_MODULE);
	registerCrudService(PURCHASE_ORDER_SCHEMA_NAME, purchaseOrderService);

	const unsubscribers = [
		...transitionSubscriptions(bus),
		...alternativeSubscriptions(bus),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

/**
 * The nine actions that move one order through its lifecycle.
 *
 * Split from the sourcing-group ones below only to keep each function inside the line budget; the
 * division is along a real seam, since these act on the order named in the path and those do not.
 */
function transitionSubscriptions(bus: ICommandBus): (() => void)[] {
	return [
		bus.subscribe(
			PurchaseOrderCommands.CONFIRM,
			cmd => purchaseOrderService.confirm(confirmRequest(cmd)),
		),
		bus.subscribe(
			PurchaseOrderCommands.APPROVE,
			cmd => purchaseOrderService.approve(actionRequest(cmd)),
		),
		bus.subscribe(
			PurchaseOrderCommands.REPRICE,
			cmd => purchaseOrderService.reprice(actionRequest(cmd)),
		),
		bus.subscribe(
			PurchaseOrderCommands.CANCEL,
			cmd => purchaseOrderService.cancel(reasonedRequest(cmd)),
		),
		bus.subscribe(
			PurchaseOrderCommands.SEND,
			cmd => purchaseOrderService.send(actionRequest(cmd)),
		),
		bus.subscribe(
			PurchaseOrderCommands.LOCK,
			cmd => purchaseOrderService.lock(actionRequest(cmd)),
		),
		bus.subscribe(
			PurchaseOrderCommands.UNLOCK,
			cmd => purchaseOrderService.unlock(reasonedRequest(cmd)),
		),
		bus.subscribe(
			PurchaseOrderCommands.ACKNOWLEDGE,
			cmd => purchaseOrderService.acknowledge(actionRequest(cmd)),
		),
		bus.subscribe(
			PurchaseOrderCommands.DUPLICATE,
			cmd => purchaseOrderService.duplicate(actionRequest(cmd)),
		),
	];
}

/**
 * The three that concern a sourcing group rather than one order: merging several into one, opening
 * a competing quotation, and comparing the ones already open.
 */
function alternativeSubscriptions(bus: ICommandBus): (() => void)[] {
	return [
		bus.subscribe(
			PurchaseOrderCommands.MERGE,
			cmd => purchaseOrderService.merge(mergeRequest(cmd)),
		),
		bus.subscribe(
			PurchaseOrderCommands.CREATE_ALTERNATIVE,
			cmd => purchaseOrderService.createAlternative(alternativeRequest(cmd)),
		),
		bus.subscribe(
			PurchaseOrderCommands.COMPARE_ALTERNATIVES,
			cmd => purchaseOrderService.compareAlternatives(actionRequest(cmd)),
		),
	];
}

/**
 * The `{id, etag}` a contextual action publishes for the record it fired on.
 *
 * `etag` is passed through rather than dropped: it is what makes the backend refuse to act on a
 * stale read, so two people confirming the same quotation do not both succeed.
 */
function actionRequest(command: Command): OrderActionRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		id: String(payload.id ?? ''),
		etag: payload.etag == null ? undefined : String(payload.etag),
	};
}

/**
 * Confirm, plus the answer to the open-alternatives warning.
 *
 * `alternative_choice` is omitted rather than sent empty when the prompt collected nothing: the
 * backend distinguishes "not answered" from an answer, and only refuses the confirm when the order
 * actually has open siblings (§31). Sending `''` would look like an answer it cannot read.
 */
function confirmRequest(command: Command): OrderActionRequest {
	const payload = command.payload as Record<string, unknown>;
	const choice = payload.alternative_choice;
	return {
		...actionRequest(command),
		alternative_choice: choice == null || choice === '' ? undefined : String(choice),
	};
}

/**
 * Cancel and unlock. The backend REQUIRES a reason on unlock and accepts an optional one on cancel.
 *
 * Neither can be collected today: a prompt narrows the page's own resource schema to the named
 * fields, and `reason` is not a field of the order. So this sends the empty string, which cancel
 * accepts and unlock refuses by name. See the note in `pages/pages.test.ts`.
 */
function reasonedRequest(command: Command): ReasonedActionRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		...actionRequest(command),
		reason: String(payload.reason ?? ''),
	};
}

/** Create-alternative, which names the vendor to quote against this order. */
function alternativeRequest(command: Command): CreateAlternativeRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		...actionRequest(command),
		vendor_id: String(payload.vendor_id ?? ''),
	};
}

/**
 * Merge, which is collection-level: it names the orders and no single record.
 *
 * The id of the record the action fired on is deliberately dropped — the backend chooses the merge
 * target itself, the oldest by deadline, rather than taking the caller's word for it.
 */
function mergeRequest(command: Command): MergeOrdersRequest {
	const payload = command.payload as Record<string, unknown>;
	const ids = payload.order_ids ?? payload.ids;
	return {
		order_ids: Array.isArray(ids) ? ids.map(String) : [],
	};
}
