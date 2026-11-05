import React from 'react';

import type { PromotionQuote } from '../../../../features/sales/salesOrder/promotionQuote';


/**
 * The last quote shown per order, shared by the Promotions panel and the header's Confirm: the two
 * render in separate trees, and Confirm must send the reference the cashier actually saw.
 */
const quotes = new Map<string, PromotionQuote>();
const listeners = new Set<() => void>();

export function setOrderQuote(orderId: string, quote: PromotionQuote | null): void {
	if (quote) {
		quotes.set(orderId, quote);
	}
	else {
		quotes.delete(orderId);
	}
	listeners.forEach(listener => listener());
}

export function getOrderQuote(orderId: string | undefined): PromotionQuote | null {
	return orderId ? quotes.get(orderId) ?? null : null;
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function useOrderQuote(orderId: string | undefined): PromotionQuote | null {
	return React.useSyncExternalStore(subscribe, () => getOrderQuote(orderId), () => null);
}
