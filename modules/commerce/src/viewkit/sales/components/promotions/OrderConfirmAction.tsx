import { Group, Stack, Text, Textarea } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Button, Modal } from '@nikkierp/ui/components';
import { useCommandBus } from '@nikkierp/ui/microApp';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { useActionLock, useOptionalResourceUpdateContext, useResourceFormView } from '@nikkierp/viewkit-mantine';
import React from 'react';
import { z } from 'zod';

import { QuoteTotals } from './OrderPromotionsPanel';
import { getOrderQuote, setOrderQuote } from './quoteStore';
import { findError, quoteFromError } from './quoteView';
import { usePromotionActions } from './usePromotionActions';
import { SALES_ORDER_SCHEMA_NAME } from '../../../../constants/sales';
import { SalesOrderCommands } from '../../../../features/sales/salesOrder/commands';
import { ORDER_CONFIRM_ACTION } from '../../ids';
import { failureText, notify, TEST_ID_MODULE, useSalesText } from '../salesText';

import type { PromotionQuote } from '../../../../features/sales/salesOrder/promotionQuote';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


type ActionProps = { label?: string };

export const orderConfirmActionRenderer: IComponentRenderer<ActionProps> = {
	type: ORDER_CONFIRM_ACTION,
	propsSchema: z.object({ label: z.string().optional() }).strict(),
	render(props) {
		return (
			<ComponentAnchor id={ORDER_CONFIRM_ACTION}>
				<OrderConfirmAction label={props.label} />
			</ComponentAnchor>
		);
	},
};

type Order = { id: string, etag?: string, refresh: () => void };

/**
 * Confirm with the quote the cashier saw: its `calculation_reference` goes along, and a mismatch answers
 * `requote_required` with the fresh quote, shown for review before a Re-quote. Without a quote on screen the
 * backend compares against the stored one. The page's `condition` keeps it to drafts.
 */
function OrderConfirmAction({ label }: ActionProps): React.ReactNode {
	const update = useOptionalResourceUpdateContext();
	const updateMode = useResourceFormView()?.updateMode ?? false;
	const lock = useActionLock(SALES_ORDER_SCHEMA_NAME, 'confirm');
	const text = useSalesText();
	const [opened, setOpened] = React.useState(false);
	const resource = update?.resource;
	if (!update || typeof resource?.id !== 'string' || updateMode) {
		return null;
	}
	const order: Order = {
		id: resource.id, etag: typeof resource.etag === 'string' ? resource.etag : undefined, refresh: update.refresh,
	};
	return (
		<>
			<Button
				variant='filled'
				locked={lock.locked}
				lockedMissing={lock.missing}
				onClick={() => setOpened(true)}
				{...testAttrs(TEST_ID_MODULE, 'orderConfirm', 'open')}
			>
				{label ?? text.t('actions.confirm')}
			</Button>
			{opened ? <ConfirmModalBody order={order} onClose={() => setOpened(false)} /> : null}
		</>
	);
}

function ConfirmModalBody({ order, onClose }: { order: Order, onClose: () => void }): React.ReactNode {
	const text = useSalesText();
	const bus = useCommandBus();
	const [note, setNote] = React.useState('');
	const [pending, setPending] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [requote, setRequote] = React.useState<{ quote: PromotionQuote | null } | null>(null);
	const submit = async () => {
		setPending(true);
		setError(null);
		try {
			const reference = getOrderQuote(order.id)?.calculation_reference;
			const response = await bus.publish({
				name: SalesOrderCommands.CONFIRM,
				payload: {
					id: order.id, etag: order.etag, confirmation_note: note.trim(),
					accepted_calculation_reference: reference,
				},
			});
			const errors = response.result?.clientErrors ?? [];
			const refused = findError(errors, 'promotion.requote_required');
			if (refused) {
				setRequote({ quote: quoteFromError(refused) });
				setError(text.translateError(refused));
				return;
			}
			const failure = failureText(text, errors, Boolean(response.error), 'promotion.panel.generic_error');
			if (failure) {
				setError(failure);
				return;
			}
			setOrderQuote(order.id, null);
			onClose();
			order.refresh();
		}
		finally {
			setPending(false);
		}
	};
	if (requote) {
		return <RequoteModal order={order} quote={requote.quote} message={error} onClose={onClose} />;
	}
	return (
		<Modal opened onClose={onClose} title={text.t('actions.confirm.title')} centered>
			<Stack gap='sm' {...testAttrs(TEST_ID_MODULE, 'orderConfirm', 'modal')}>
				<Textarea
					label={text.t('fields.confirmation_note')}
					value={note}
					autosize
					minRows={2}
					onChange={event => setNote(event.currentTarget.value)}
					{...testAttrs(TEST_ID_MODULE, 'orderConfirm', 'note')}
				/>
				{error ? <Text size='sm' c='var(--mantine-color-error)'>{error}</Text> : null}
				<Group justify='flex-end'>
					<Button
						variant='filled'
						loading={pending}
						onClick={() => void submit()}
						{...testAttrs(TEST_ID_MODULE, 'orderConfirm', 'submit')}
					>
						{text.t('actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}

/** The fresh totals the refusal carried, and a Re-quote that stores them as the accepted quote. */
function RequoteModal({ order, quote, message, onClose }: {
	order: Order, quote: PromotionQuote | null, message: string | null, onClose: () => void,
}): React.ReactNode {
	const text = useSalesText();
	const actions = usePromotionActions(order, text);
	const lock = useActionLock(SALES_ORDER_SCHEMA_NAME, 'update');
	const requote = async () => {
		if (await actions.requote()) {
			notify('info', text.t('promotion.requote.title'));
			onClose();
		}
	};
	return (
		<Modal opened onClose={onClose} title={text.t('promotion.requote.title')} centered>
			<Stack gap='sm' {...testAttrs(TEST_ID_MODULE, 'orderConfirm', 'requoteModal')}>
				<Text size='sm'>{message ?? text.t('promotion.requote.message')}</Text>
				{quote ? (
					<>
						<Text fw={600} size='sm'>{text.t('promotion.requote.new_totals')}</Text>
						<QuoteTotals quote={quote} text={text} />
					</>
				) : null}
				<Group justify='flex-end'>
					<Button
						variant='filled'
						locked={lock.locked}
						lockedMissing={lock.missing}
						loading={actions.pending}
						onClick={() => void requote()}
						{...testAttrs(TEST_ID_MODULE, 'orderConfirm', 'requote')}
					>
						{text.t('promotion.requote.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
