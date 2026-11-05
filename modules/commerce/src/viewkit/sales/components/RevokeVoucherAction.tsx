import { Stack, Text, Textarea } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Button, Modal } from '@nikkierp/ui/components';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { useActionLock, useOptionalResourceUpdateContext, useResourceFormView } from '@nikkierp/viewkit-mantine';
import React from 'react';
import { z } from 'zod';

import { failureText, notify, TEST_ID_MODULE, useSalesText } from './salesText';
import { SALES_VOUCHER_SCHEMA_NAME, VOUCHER_STATUS_ACTIVE } from '../../../constants/sales';
import { SalesVoucherCommands } from '../../../features/sales/salesVoucher/commands';
import { REVOKE_VOUCHER_ACTION } from '../ids';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


const NOTE_MAX = 500;

type ActionProps = { label?: string };

export const revokeVoucherActionRenderer: IComponentRenderer<ActionProps> = {
	type: REVOKE_VOUCHER_ACTION,
	propsSchema: z.object({ label: z.string().optional() }).strict(),
	render(props) {
		return (
			<ComponentAnchor id={REVOKE_VOUCHER_ACTION}>
				<RevokeVoucherAction label={props.label} />
			</ComponentAnchor>
		);
	},
};

/** Revoke, with the optional note the backend records. Terminal: a revoked code never becomes usable again. */
function RevokeVoucherAction({ label }: ActionProps): React.ReactNode {
	const update = useOptionalResourceUpdateContext();
	const updateMode = useResourceFormView()?.updateMode ?? false;
	const lock = useActionLock(SALES_VOUCHER_SCHEMA_NAME, 'revoke');
	const text = useSalesText();
	const [opened, setOpened] = React.useState(false);
	const resource = update?.resource;
	if (!resource || updateMode || resource.status !== VOUCHER_STATUS_ACTIVE) {
		return null;
	}
	return (
		<>
			<Button
				variant='outline'
				color='red'
				locked={lock.locked}
				lockedMissing={lock.missing}
				onClick={() => setOpened(true)}
				{...testAttrs(TEST_ID_MODULE, 'voucherRevoke', 'open')}
			>
				{label ?? text.t('actions.revoke')}
			</Button>
			{opened ? (
				<RevokeModal
					id={String(resource.id)}
					etag={typeof resource.etag === 'string' ? resource.etag : undefined}
					onClose={() => setOpened(false)}
					onDone={() => update?.refresh()}
				/>
			) : null}
		</>
	);
}

function RevokeModal({ id, etag, onClose, onDone }: {
	id: string, etag?: string, onClose: () => void, onDone: () => void,
}): React.ReactNode {
	const text = useSalesText();
	const [note, setNote] = React.useState('');
	const revoke = useCommand(SalesVoucherCommands.REVOKE, { operation: 'sales.voucher.revoke' });
	const submit = async () => {
		const response = await revoke.publish({ id, etag, note: note.trim() });
		const failure = failureText(text, response.result?.clientErrors ?? [], Boolean(response.error),
			'promotion.panel.generic_error');
		if (failure) {
			return;
		}
		notify('info', text.t('promotion.revoke.done'));
		onClose();
		onDone();
	};
	const errors = failureText(text, revoke.clientErrors, Boolean(revoke.error), 'promotion.panel.generic_error');
	return (
		<Modal opened onClose={onClose} title={text.t('promotion.revoke.title')} centered>
			<Stack gap='sm' {...testAttrs(TEST_ID_MODULE, 'voucherRevoke', 'modal')}>
				<Text size='sm'>{text.t('promotion.revoke.message')}</Text>
				<Textarea
					label={text.t('promotion.revoke.note')}
					placeholder={text.t('promotion.revoke.note_placeholder')}
					value={note}
					maxLength={NOTE_MAX}
					autosize
					minRows={2}
					onChange={event => setNote(event.currentTarget.value)}
					{...testAttrs(TEST_ID_MODULE, 'voucherRevoke', 'note')}
				/>
				{errors ? <Text size='sm' c='var(--mantine-color-error)'>{errors}</Text> : null}
				<Stack align='flex-end'>
					<Button
						variant='filled'
						color='red'
						loading={revoke.isPending}
						onClick={() => void submit()}
						{...testAttrs(TEST_ID_MODULE, 'voucherRevoke', 'submit')}
					>
						{text.t('actions.revoke')}
					</Button>
				</Stack>
			</Stack>
		</Modal>
	);
}
