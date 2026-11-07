import { defineComponent } from '@nikkierp/viewengine/metadata';

import {
	ATTRIBUTE_VALUES, MOVE_DETAILED_OPERATIONS, STOCK_TRANSFER_ALL_MOVES, STOCK_TRANSFER_MOVES, TEMPLATE_ATTRIBUTES,
	TEMPLATE_ATTRIBUTES_HEADER,
} from './ids';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * The attribute's values, edited inline and saved with the attribute's own create or update. It
 * belongs in both `createNodes` and `childrenNodes`; React-free so pages stay plain JSON.
 */
export function attributeValuesNode(): ComponentNode {
	return defineComponent({ component: ATTRIBUTE_VALUES });
}

/**
 * The template's attribute lines and exclusions, saved with the template's own create or update.
 * It belongs in both `createNodes` and `childrenNodes`.
 */
export function templateAttributesNode(): ComponentNode {
	return defineComponent({ component: TEMPLATE_ATTRIBUTES });
}

/** Resolve variant and "All attributes", for the Attributes section header's `rightSegment`. */
export function templateAttributesHeaderNode(): ComponentNode {
	return defineComponent({ component: TEMPLATE_ATTRIBUTES_HEADER });
}

/**
 * The transfer's moves, edited inline while it is a draft and saved with the transfer's own create
 * or update. It belongs in both `createNodes` and `childrenNodes`.
 */
export function stockTransferMovesNode(): ComponentNode {
	return defineComponent({ component: STOCK_TRANSFER_MOVES });
}

/** "All moves", for the Moves section header's `rightSegment`; hidden while the transfer is edited. */
export function stockTransferAllMovesNode(): ComponentNode {
	return defineComponent({ component: STOCK_TRANSFER_ALL_MOVES });
}

/** The move's Detailed operations button and dialog, for the move detail's fields section header. */
export function moveDetailedOperationsNode(): ComponentNode {
	return defineComponent({ component: MOVE_DETAILED_OPERATIONS });
}

export * from './ids';
