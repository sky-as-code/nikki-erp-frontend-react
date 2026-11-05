import { Command, ICommandBus } from '@nikkierp/common/commandBus';

import {
	ApplyVoucherRequest, OrderActionRequest, RemoveVoucherRequest, SelectPromotionRewardRequest, salesOrderService,
} from './salesOrderService';
import { SALES_MODULE, SALES_ORDER_SCHEMA_NAME } from '../../../constants/sales';


const PREFIX = `${SALES_MODULE}.${SALES_ORDER_SCHEMA_NAME}`;

/**
 * The draft order's promotion actions. Each answers a `PromotionQuote` (see `./promotionQuote`);
 * none consumes usage, which happens only inside confirm.
 */
export const SalesOrderPromotionCommands = Object.freeze({
	APPLY_VOUCHER: `${PREFIX}.apply_voucher`,
	REMOVE_VOUCHER: `${PREFIX}.remove_voucher`,
	SELECT_PROMOTION_REWARD: `${PREFIX}.select_promotion_reward`,
	PREVIEW_PROMOTIONS: `${PREFIX}.preview_promotions`,
} as const);

export function promotionSubscriptions(bus: ICommandBus): (() => void)[] {
	return [
		bus.subscribe(
			SalesOrderPromotionCommands.APPLY_VOUCHER,
			cmd => salesOrderService.applyVoucher(applyVoucherRequest(cmd)),
		),
		bus.subscribe(
			SalesOrderPromotionCommands.REMOVE_VOUCHER,
			cmd => salesOrderService.removeVoucher(removeVoucherRequest(cmd)),
		),
		bus.subscribe(
			SalesOrderPromotionCommands.SELECT_PROMOTION_REWARD,
			cmd => salesOrderService.selectPromotionReward(selectRewardRequest(cmd)),
		),
		bus.subscribe(
			SalesOrderPromotionCommands.PREVIEW_PROMOTIONS,
			cmd => salesOrderService.previewPromotions(orderRequest(cmd)),
		),
	];
}

function payloadOf(command: Command): Record<string, unknown> {
	return (command.payload ?? {}) as Record<string, unknown>;
}

function orderRequest(command: Command): OrderActionRequest {
	const payload = payloadOf(command);
	return {
		id: String(payload.id ?? ''),
		etag: payload.etag == null ? undefined : String(payload.etag),
	};
}

/** `replace_existing` is sent only when true: absent is how the backend learns to ask first. */
export function applyVoucherRequest(command: Command): ApplyVoucherRequest {
	const payload = payloadOf(command);
	const request: ApplyVoucherRequest = { ...orderRequest(command), code: String(payload.code ?? '').trim() };
	return payload.replace_existing === true ? { ...request, replace_existing: true } : request;
}

function removeVoucherRequest(command: Command): RemoveVoucherRequest {
	return { ...orderRequest(command), promotion_id: String(payloadOf(command).promotion_id ?? '') };
}

/** A decline carries no reward; a reward choice carries no decline flag. */
export function selectRewardRequest(command: Command): SelectPromotionRewardRequest {
	const payload = payloadOf(command);
	const request = { ...orderRequest(command), promotion_id: String(payload.promotion_id ?? '') };
	if (payload.decline === true) {
		return { ...request, decline: true };
	}
	const rewardId = payload.reward_id;
	return rewardId == null || rewardId === '' ? request : { ...request, reward_id: String(rewardId) };
}
