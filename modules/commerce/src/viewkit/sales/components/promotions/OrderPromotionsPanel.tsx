import { Alert, Badge, CloseButton, Group, Stack, Table, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Button, ConfirmModal, Input, LocalizedMoney } from '@nikkierp/ui/components';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { useActionLock, useOptionalResourceUpdateContext, useResourceFormView } from '@nikkierp/viewkit-mantine';
import React from 'react';
import { z } from 'zod';

import { PromotionProgramList } from './PromotionProgramList';
import { useOrderQuote } from './quoteStore';
import { attachedVouchers, programViews, warningKeyOf } from './quoteView';
import { usePromotionActions } from './usePromotionActions';
import { ORDER_STATUS_DRAFT, SALES_ORDER_SCHEMA_NAME } from '../../../../constants/sales';
import { ORDER_PROMOTIONS_PANEL } from '../../ids';
import { TEST_ID_MODULE, useSalesText } from '../salesText';

import type { PromotionActions } from './usePromotionActions';
import type { PromotionQuote } from '../../../../features/sales/salesOrder/promotionQuote';
import type { SalesText } from '../salesText';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const orderPromotionsPanelRenderer: IComponentRenderer<Record<string, never>> = {
	type: ORDER_PROMOTIONS_PANEL,
	propsSchema: z.object({}).strict(),
	render() {
		return (
			<ComponentAnchor id={ORDER_PROMOTIONS_PANEL}>
				<OrderPromotionsPanel />
			</ComponentAnchor>
		);
	},
};

/**
 * The draft order's promotions. The quote is computed by the server on demand (Re-quote) and after every
 * voucher or reward change; nothing here is editable as an amount. A confirmed order shows its applications
 * in the related tabs instead.
 */
function OrderPromotionsPanel(): React.ReactNode {
	const update = useOptionalResourceUpdateContext();
	const updateMode = useResourceFormView()?.updateMode ?? false;
	const text = useSalesText();
	const resource = update?.resource;
	const orderId = typeof resource?.id === 'string' ? resource.id : undefined;
	const quote = useOrderQuote(orderId);
	if (!update || !resource || !orderId) {
		return null;
	}
	if (resource.status !== ORDER_STATUS_DRAFT) {
		return <Text size='sm' c='dimmed'>{text.t('promotion.panel.draft_only')}</Text>;
	}
	const order = { id: orderId, etag: typeof resource.etag === 'string' ? resource.etag : undefined, refresh: update.refresh };
	return <DraftPromotions order={order} quote={quote} text={text} disabled={updateMode} />;
}

function DraftPromotions({ order, quote, text, disabled }: {
	order: { id: string, etag?: string, refresh: () => void },
	quote: PromotionQuote | null,
	text: SalesText,
	disabled: boolean,
}): React.ReactNode {
	const actions = usePromotionActions(order, text);
	const updateLock = useActionLock(SALES_ORDER_SCHEMA_NAME, 'update');
	const voucherLock = useActionLock(SALES_ORDER_SCHEMA_NAME, 'apply_voucher');
	const programs = React.useMemo(() => programViews(quote), [quote]);
	return (
		<Stack gap='sm' {...testAttrs(TEST_ID_MODULE, 'orderPromotions')}>
			<Text size='xs' c='dimmed'>{text.t('promotion.panel.amounts_read_only')}</Text>
			<VoucherInput actions={actions} text={text} locked={voucherLock.locked} disabled={disabled} />
			<AttachedVouchers quote={quote} actions={actions} text={text} locked={voucherLock.locked || disabled} />
			<Group justify='space-between'>
				<Text fw={600} size='sm'>{text.t('promotion.panel.programs')}</Text>
				<Button
					variant='outline'
					size='compact-sm'
					locked={updateLock.locked}
					lockedMissing={updateLock.missing}
					disabled={disabled}
					loading={actions.pending}
					onClick={() => void actions.requote()}
					{...testAttrs(TEST_ID_MODULE, 'orderPromotions', 'requote')}
				>
					{text.t('promotion.panel.requote')}
				</Button>
			</Group>
			{quote ? (
				<PromotionProgramList
					programs={programs}
					actions={actions}
					text={text}
					locked={updateLock.locked || disabled}
				/>
			) : <Text size='sm' c='dimmed'>{text.t('promotion.panel.quote_unavailable')}</Text>}
			<QuoteWarnings quote={quote} text={text} />
			{quote ? <QuoteTotals quote={quote} text={text} /> : null}
			<ConfirmModal
				opened={actions.replaceCode != null}
				onClose={actions.cancelReplace}
				onConfirm={() => void actions.applyVoucher(actions.replaceCode ?? '', true)}
				title={text.t('promotion.replace_voucher.title')}
				message={text.t('promotion.replace_voucher.message', { code: actions.replaceCode ?? '' })}
				confirmLabel={text.t('promotion.replace_voucher.confirm')}
				testId={`${TEST_ID_MODULE}.orderPromotions.replaceVoucher`}
			/>
		</Stack>
	);
}

/** Scan-friendly: a scanner types the code and sends Enter, which submits. */
function VoucherInput({ actions, text, locked, disabled }: {
	actions: PromotionActions, text: SalesText, locked: boolean, disabled: boolean,
}): React.ReactNode {
	const [code, setCode] = React.useState('');
	const submit = async () => {
		const trimmed = code.trim();
		if (trimmed !== '' && await actions.applyVoucher(trimmed)) {
			setCode('');
		}
	};
	return (
		<Group gap='xs' wrap='nowrap'>
			<Input
				style={{ flex: 1 }}
				value={code}
				placeholder={text.t('promotion.panel.voucher_placeholder')}
				disabled={locked || disabled || actions.pending}
				autoComplete='off'
				onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCode(event.currentTarget.value)}
				onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						void submit();
					}
				}}
				{...testAttrs(TEST_ID_MODULE, 'orderPromotions', 'voucherInput')}
			/>
			<Button
				variant='filled'
				locked={locked}
				disabled={disabled || code.trim() === ''}
				loading={actions.pending}
				onClick={() => void submit()}
				{...testAttrs(TEST_ID_MODULE, 'orderPromotions', 'applyVoucher')}
			>
				{text.t('promotion.panel.apply_voucher')}
			</Button>
		</Group>
	);
}

function AttachedVouchers({ quote, actions, text, locked }: {
	quote: PromotionQuote | null, actions: PromotionActions, text: SalesText, locked: boolean,
}): React.ReactNode {
	const vouchers = attachedVouchers(quote);
	if (vouchers.length === 0) {
		return null;
	}
	return (
		<Group gap='xs' {...testAttrs(TEST_ID_MODULE, 'orderPromotions', 'vouchers')}>
			{vouchers.map(voucher => (
				<Badge
					key={voucher.promotionId}
					variant='light'
					color='grape'
					rightSection={locked ? null : (
						<CloseButton
							size='xs'
							aria-label={text.t('promotion.panel.remove_voucher')}
							onClick={() => void actions.removeVoucher(voucher.promotionId)}
							{...testAttrs(TEST_ID_MODULE, 'orderPromotions', 'removeVoucher', voucher.promotionId)}
						/>
					)}
				>
					{voucher.code}
				</Badge>
			))}
		</Group>
	);
}

function QuoteWarnings({ quote, text }: { quote: PromotionQuote | null, text: SalesText }): React.ReactNode {
	const warnings = quote?.warnings ?? [];
	if (warnings.length === 0) {
		return null;
	}
	return (
		<Alert color='yellow' title={text.t('promotion.panel.warnings')} {...testAttrs(TEST_ID_MODULE, 'orderPromotions', 'warnings')}>
			<Stack gap={2}>
				{warnings.map((warning, index) => (
					<Text key={`${warning.code}:${warning.promotion_id ?? index}`} size='sm'>{text.t(warningKeyOf(warning))}</Text>
				))}
			</Stack>
		</Alert>
	);
}

export function QuoteTotals({ quote, text }: { quote: PromotionQuote, text: SalesText }): React.ReactNode {
	const rows: [string, string][] = [
		['promotion.panel.subtotal', quote.totals.subtotal],
		['promotion.panel.discount_total', quote.totals.discount_total],
		['promotion.panel.tax_total', quote.totals.tax_total],
		['promotion.panel.grand_total', quote.totals.grand_total],
	];
	return (
		<Table withRowBorders={false} {...testAttrs(TEST_ID_MODULE, 'orderPromotions', 'totals')}>
			<Table.Tbody>
				{rows.map(([key, amount]) => (
					<Table.Tr key={key}>
						<Table.Td><Text size='sm'>{text.t(key)}</Text></Table.Td>
						<Table.Td ta='right'><LocalizedMoney value={amount} /></Table.Td>
					</Table.Tr>
				))}
			</Table.Tbody>
		</Table>
	);
}
