import { Code, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Button, Input, LocalizedNumberInput, Modal } from '@nikkierp/ui/components';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { useActionLock, useOptionalResourceUpdateContext, useResourceFormView } from '@nikkierp/viewkit-mantine';
import React from 'react';
import { z } from 'zod';

import { generatedCodesText, parseGenerateResult } from './promotionHelpers';
import { failureText, notify, TEST_ID_MODULE, useSalesText } from './salesText';
import { SALES_VOUCHER_SCHEMA_NAME, VOUCHER_BATCH_MAX } from '../../../constants/sales';
import { SalesVoucherCommands } from '../../../features/sales/salesVoucher/commands';
import { GENERATE_VOUCHERS_ACTION } from '../ids';

import type { GeneratedVoucher } from './promotionHelpers';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


type ActionProps = { label?: string };

export const generateVouchersActionRenderer: IComponentRenderer<ActionProps> = {
	type: GENERATE_VOUCHERS_ACTION,
	propsSchema: z.object({ label: z.string().optional() }).strict(),
	render(props) {
		return (
			<ComponentAnchor id={GENERATE_VOUCHERS_ACTION}>
				<GenerateVouchersAction label={props.label} />
			</ComponentAnchor>
		);
	},
};

/** On a saved promotion only; the page's `condition` limits it to the voucher-gated program types. */
function GenerateVouchersAction({ label }: ActionProps): React.ReactNode {
	const update = useOptionalResourceUpdateContext();
	const updateMode = useResourceFormView()?.updateMode ?? false;
	const lock = useActionLock(SALES_VOUCHER_SCHEMA_NAME, 'generate');
	const text = useSalesText();
	const [opened, setOpened] = React.useState(false);
	const promotionId = update?.resource?.id;
	if (typeof promotionId !== 'string' || updateMode) {
		return null;
	}
	return (
		<>
			<Button
				variant='outline'
				locked={lock.locked}
				lockedMissing={lock.missing}
				onClick={() => setOpened(true)}
				{...testAttrs(TEST_ID_MODULE, 'generateVouchers', 'open')}
			>
				{label ?? text.t('promotion.generate.button')}
			</Button>
			{opened ? <GenerateVouchersModal promotionId={promotionId} onClose={() => setOpened(false)} /> : null}
		</>
	);
}

/** The codes come back only here, once: the modal keeps them on screen with a copy-all until it is closed. */
export function GenerateVouchersModal({ promotionId, onClose }: { promotionId: string, onClose: () => void }) {
	const text = useSalesText();
	const [quantity, setQuantity] = React.useState<string | number>(10);
	const [prefix, setPrefix] = React.useState('');
	const [usageLimit, setUsageLimit] = React.useState<string | number>('');
	const [vouchers, setVouchers] = React.useState<GeneratedVoucher[] | null>(null);
	const generate = useCommand(SalesVoucherCommands.GENERATE_BATCH, { operation: 'sales.voucher.generate_batch' });
	const submit = async () => {
		const response = await generate.publish({
			promotion_id: promotionId, quantity, prefix: prefix.trim().toUpperCase(), usage_limit: usageLimit,
		});
		setVouchers(response.result?.clientErrors?.length ? null : parseGenerateResult(response.result?.data));
	};
	const errors = failureText(text, generate.clientErrors, Boolean(generate.error), 'promotion.panel.generic_error');
	return (
		<Modal opened onClose={onClose} title={text.t('promotion.generate.title')} centered size='lg'>
			<Stack gap='sm' {...testAttrs(TEST_ID_MODULE, 'generateVouchers', 'modal')}>
				{vouchers ? <GeneratedCodes vouchers={vouchers} /> : (
					<>
						<LocalizedNumberInput
							label={text.t('promotion.generate.quantity')}
							description={text.t('promotion.generate.quantity_hint', { max: VOUCHER_BATCH_MAX })}
							min={1}
							max={VOUCHER_BATCH_MAX}
							allowDecimal={false}
							grouped={false}
							value={quantity}
							onChange={setQuantity}
							{...testAttrs(TEST_ID_MODULE, 'generateVouchers', 'quantity')}
						/>
						<Input.Wrapper
							label={text.t('promotion.generate.prefix')}
							description={text.t('promotion.generate.prefix_hint')}
						>
							<Input
								value={prefix}
								maxLength={24}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => (
									setPrefix(event.currentTarget.value)
								)}
								{...testAttrs(TEST_ID_MODULE, 'generateVouchers', 'prefix')}
							/>
						</Input.Wrapper>
						<LocalizedNumberInput
							label={text.t('promotion.generate.usage_limit')}
							min={1}
							allowDecimal={false}
							grouped={false}
							value={usageLimit}
							onChange={setUsageLimit}
							{...testAttrs(TEST_ID_MODULE, 'generateVouchers', 'usageLimit')}
						/>
					</>
				)}
				{errors ? <Text size='sm' c='var(--mantine-color-error)'>{errors}</Text> : null}
				<Group justify='flex-end'>
					<Button color='gray' onClick={onClose} {...testAttrs(TEST_ID_MODULE, 'generateVouchers', 'close')}>
						{text.t('promotion.generate.close')}
					</Button>
					{vouchers ? null : (
						<Button
							variant='filled'
							loading={generate.isPending}
							disabled={!(Number(quantity) >= 1)}
							onClick={() => void submit()}
							{...testAttrs(TEST_ID_MODULE, 'generateVouchers', 'submit')}
						>
							{text.t('promotion.generate.submit')}
						</Button>
					)}
				</Group>
			</Stack>
		</Modal>
	);
}

function GeneratedCodes({ vouchers }: { vouchers: GeneratedVoucher[] }): React.ReactNode {
	const text = useSalesText();
	const copyAll = async () => {
		try {
			await navigator.clipboard.writeText(generatedCodesText(vouchers));
			notify('info', text.t('promotion.generate.copied'));
		}
		catch {
			notify('error', text.t('promotion.panel.generic_error'));
		}
	};
	return (
		<Stack gap='xs'>
			<Group justify='space-between'>
				<Text size='sm'>{text.t('promotion.generate.result', { count: vouchers.length })}</Text>
				<Button
					variant='outline'
					size='compact-sm'
					onClick={() => void copyAll()}
					{...testAttrs(TEST_ID_MODULE, 'generateVouchers', 'copyAll')}
				>
					{text.t('promotion.generate.copy_all')}
				</Button>
			</Group>
			<ScrollArea.Autosize mah={280}>
				<Code block {...testAttrs(TEST_ID_MODULE, 'generateVouchers', 'codes')}>{generatedCodesText(vouchers)}</Code>
			</ScrollArea.Autosize>
		</Stack>
	);
}
