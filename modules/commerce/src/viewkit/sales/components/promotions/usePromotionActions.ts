import { useCommandBus } from '@nikkierp/ui/microApp';
import React from 'react';

import { setOrderQuote } from './quoteStore';
import { findError, isPromotionQuote } from './quoteView';
import { SalesOrderPromotionCommands } from '../../../../features/sales/salesOrder/promotionCommands';
import { failureText, notify } from '../salesText';

import type { SalesText } from '../salesText';
import type { ClientErrorItem } from '@nikkierp/common/types';


export type PromotionActions = {
	pending: boolean,
	/** Set when `apply_voucher` answered `voucher_replace_required`: the code waiting for the cashier's yes. */
	replaceCode: string | null,
	applyVoucher: (code: string, replaceExisting?: boolean) => Promise<boolean>,
	cancelReplace: () => void,
	removeVoucher: (promotionId: string) => Promise<boolean>,
	selectReward: (promotionId: string, rewardId: string) => Promise<boolean>,
	decline: (promotionId: string) => Promise<boolean>,
	requote: () => Promise<boolean>,
};

type Order = { id: string, etag?: string, refresh: () => void };

type Runner = (
	command: string, payload: Record<string, unknown>, onRefused?: (errors: ClientErrorItem[]) => boolean,
) => Promise<boolean>;

/** Posts one order action and stores the quote it answers; `pending` covers the call. */
function usePromotionRunner(order: Order, text: SalesText): { run: Runner, pending: boolean } {
	const bus = useCommandBus();
	const [pending, setPending] = React.useState(false);
	const { id, etag, refresh } = order;

	const run = React.useCallback(async (
		command: string, payload: Record<string, unknown>, onRefused?: (errors: ClientErrorItem[]) => boolean,
	): Promise<boolean> => {
		setPending(true);
		try {
			const response = await bus.publish({ name: command, payload: { id, etag, ...payload } });
			const errors = response.result?.clientErrors ?? [];
			if (errors.length > 0 && onRefused?.(errors)) {
				return false;
			}
			const failure = failureText(text, errors, Boolean(response.error), 'promotion.panel.generic_error');
			if (failure) {
				notify('error', failure);
				return false;
			}
			const data = response.result?.data;
			setOrderQuote(id, isPromotionQuote(data) ? data : null);
			refresh();
			return true;
		}
		finally {
			setPending(false);
		}
	}, [bus, id, etag, refresh, text]);
	return { run, pending };
}

/**
 * Every draft-order promotion action answers the fresh quote: it is stored for the panel and Confirm, and the
 * order is reloaded because its totals moved. A refusal is shown as one notice; no amount is ever sent.
 */
export function usePromotionActions(order: Order, text: SalesText): PromotionActions {
	const { run, pending } = usePromotionRunner(order, text);
	const [replaceCode, setReplaceCode] = React.useState<string | null>(null);

	const applyVoucher = React.useCallback(async (code: string, replaceExisting = false) => {
		// A second code for a promotion is asked about first; the retry carries `replace_existing`.
		const askReplace = (errors: ClientErrorItem[]) => {
			if (!replaceExisting && findError(errors, 'promotion.voucher_replace_required')) {
				setReplaceCode(code);
				return true;
			}
			return false;
		};
		const applied = await run(
			SalesOrderPromotionCommands.APPLY_VOUCHER, { code, replace_existing: replaceExisting }, askReplace,
		);
		if (applied) {
			setReplaceCode(null);
		}
		return applied;
	}, [run]);

	return React.useMemo(() => ({
		pending,
		replaceCode,
		applyVoucher,
		cancelReplace: () => setReplaceCode(null),
		removeVoucher: (promotionId: string) => run(
			SalesOrderPromotionCommands.REMOVE_VOUCHER, { promotion_id: promotionId },
		),
		selectReward: (promotionId: string, rewardId: string) => run(
			SalesOrderPromotionCommands.SELECT_PROMOTION_REWARD, { promotion_id: promotionId, reward_id: rewardId },
		),
		decline: (promotionId: string) => run(
			SalesOrderPromotionCommands.SELECT_PROMOTION_REWARD, { promotion_id: promotionId, decline: true },
		),
		requote: () => run(SalesOrderPromotionCommands.PREVIEW_PROMOTIONS, {}),
	}), [pending, replaceCode, applyVoucher, run]);
}
