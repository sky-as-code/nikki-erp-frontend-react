import { defineComponent } from '@nikkierp/viewengine/metadata';

import { ORDER_PROMOTIONS_PANEL } from './ids';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** The draft order's Promotions panel; React-free so the order page stays plain JSON. */
export function orderPromotionsPanelNode(): ComponentNode {
	return defineComponent({ component: ORDER_PROMOTIONS_PANEL });
}

export * from './ids';
