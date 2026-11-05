import { testAttrs } from '@nikkierp/common/utils';
import { Button } from '@nikkierp/ui/components';
import { useCommandBus } from '@nikkierp/ui/microApp';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { useActionLock, useOptionalResourceUpdateContext, useResourceFormView } from '@nikkierp/viewkit-mantine';
import React from 'react';
import { z } from 'zod';

import { idsToAdd } from './promotionHelpers';
import { failureText, notify, TEST_ID_MODULE, useSalesText } from './salesText';
import { SALES_PROMOTION_SCHEMA_NAME } from '../../../constants/sales';
import { SalesChannelCommands } from '../../../features/sales/salesChannel/commands';
import { SalesPointCommands } from '../../../features/sales/salesPoint/commands';
import { SalesPromotionCommands } from '../../../features/sales/salesPromotion/commands';
import { SELECT_ALL_CHANNELS_ACTION, SELECT_ALL_POINTS_ACTION } from '../ids';

import type { CommandBusResponse, ICommandBus } from '@nikkierp/common/commandBus';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


const PAGE_SIZE = 200;
const MAX_PAGES = 50;

type ScopeKind = { search: string, manage: string, labelKey: string, testId: string };

const CHANNELS: ScopeKind = {
	search: SalesChannelCommands.SEARCH, manage: SalesPromotionCommands.MANAGE_CHANNELS,
	labelKey: 'promotion.scope.select_all_channels', testId: 'selectAllChannels',
};
const POINTS: ScopeKind = {
	search: SalesPointCommands.SEARCH, manage: SalesPromotionCommands.MANAGE_POINTS,
	labelKey: 'promotion.scope.select_all_points', testId: 'selectAllPoints',
};

type ActionProps = { label?: string };

function rendererFor(type: string, kind: ScopeKind): IComponentRenderer<ActionProps> {
	return {
		type,
		propsSchema: z.object({ label: z.string().optional() }).strict(),
		render(props) {
			return (
				<ComponentAnchor id={type}>
					<SelectAllScopeAction kind={kind} label={props.label} />
				</ComponentAnchor>
			);
		},
	};
}

export const selectAllChannelsActionRenderer = rendererFor(SELECT_ALL_CHANNELS_ACTION, CHANNELS);
export const selectAllPointsActionRenderer = rendererFor(SELECT_ALL_POINTS_ACTION, POINTS);

async function searchIds(bus: ICommandBus, command: string, graph?: dyn.SearchGraph): Promise<string[] | null> {
	const ids: unknown[] = [];
	for (let page = 0; page < MAX_PAGES; page++) {
		const request: dyn.RestSearchRequest = { fields: ['id'], page, size: PAGE_SIZE, ...(graph ? { graph } : {}) };
		const response: CommandBusResponse<dyn.RestSearchResponse<{ id: string }>> = await bus.publish({
			name: command, payload: request,
		});
		const items = response.result?.data?.items;
		if (response.error || !items) {
			return null;
		}
		ids.push(...items.map(item => item.id));
		if (items.length < PAGE_SIZE) {
			break;
		}
	}
	return ids.filter((id): id is string => typeof id === 'string');
}

/**
 * Links every channel (or point) that exists now, in one `manage_*` call. It is a one-off snapshot, never a
 * standing "all": a channel created later is not added (BR-S02). The tab's own Refresh shows the result.
 */
function SelectAllScopeAction({ kind, label }: { kind: ScopeKind, label?: string }): React.ReactNode {
	const update = useOptionalResourceUpdateContext();
	const updateMode = useResourceFormView()?.updateMode ?? false;
	const lock = useActionLock(SALES_PROMOTION_SCHEMA_NAME, 'update');
	const bus = useCommandBus();
	const text = useSalesText();
	const [pending, setPending] = React.useState(false);
	const promotionId = update?.resource?.id;
	if (typeof promotionId !== 'string' || updateMode) {
		return null;
	}
	const run = async () => {
		setPending(true);
		try {
			const all = await searchIds(bus, kind.search);
			const linked = await searchIds(bus, kind.search, { if: ['promotions', 'linked', promotionId] });
			if (!all || !linked) {
				notify('error', text.t('promotion.panel.generic_error'));
				return;
			}
			const add = idsToAdd(all, linked);
			if (add.length > 0) {
				const response = await bus.publish({ name: kind.manage, payload: { id: promotionId, add } });
				const failure = failureText(text, response.result?.clientErrors ?? [], Boolean(response.error),
					'promotion.panel.generic_error');
				if (failure) {
					notify('error', failure);
					return;
				}
			}
			notify('info', text.t('promotion.scope.select_all_done', { count: add.length }));
		}
		finally {
			setPending(false);
		}
	};
	return (
		<Button
			variant='outline'
			title={text.t('promotion.scope.select_all_hint')}
			locked={lock.locked}
			lockedMissing={lock.missing}
			loading={pending}
			onClick={() => void run()}
			{...testAttrs(TEST_ID_MODULE, 'promotionScope', kind.testId)}
		>
			{label ?? text.t(kind.labelKey)}
		</Button>
	);
}
