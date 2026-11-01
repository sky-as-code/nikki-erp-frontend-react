import { testAttrs } from '@nikkierp/common/utils';
import { LinkButton } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { useResourceFormView, useRoutePathHref } from '@nikkierp/viewkit-mantine';
import React from 'react';
import { useParams } from 'react-router';
import { z } from 'zod';

import { MOVES_TEST_ID_PREFIX } from './moveEditors';
import { INVENTORY_MODULE, STOCK_MOVE_SCHEMA_NAME, STOCK_TRANSFER_SCHEMA_NAME } from '../../../../constants/inventory';
import { STOCK_TRANSFER_ALL_MOVES } from '../../ids';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


/** From the transfer detail's own route (`…/:id`), so `:id` is the transfer. */
// Absolute for the same reason as the move rows' links: a proxy transfer page elsewhere still lands
// on Inventory's own moves list.
const ALL_MOVES_ROUTE_PATH = `/commerce/${STOCK_TRANSFER_SCHEMA_NAME}/:id/${STOCK_MOVE_SCHEMA_NAME}`;

export const stockTransferAllMovesRenderer: IComponentRenderer<Record<string, never>> = {
	type: STOCK_TRANSFER_ALL_MOVES,
	propsSchema: z.object({}).strict(),
	render() {
		return (
			<ComponentAnchor id={STOCK_TRANSFER_ALL_MOVES}>
				<StockTransferAllMoves />
			</ComponentAnchor>
		);
	},
};

/**
 * "All stock moves", to the transfer's move list. Hidden while the transfer is created or edited: following it
 * would discard the edits.
 */
function StockTransferAllMoves(): React.ReactNode {
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	const { id } = useParams();
	const updateMode = useResourceFormView()?.updateMode ?? false;
	const href = useRoutePathHref(ALL_MOVES_ROUTE_PATH);
	if (!href || id === 'new' || updateMode) {
		return null;
	}
	return (
		<LinkButton
			to={href} mode='append' variant='subtle' size='compact-sm'
			{...testAttrs(MOVES_TEST_ID_PREFIX, 'allMoves')}
		>
			{t('stock_transfer_all_moves', { defaultValue: 'All stock moves' })}
		</LinkButton>
	);
}
