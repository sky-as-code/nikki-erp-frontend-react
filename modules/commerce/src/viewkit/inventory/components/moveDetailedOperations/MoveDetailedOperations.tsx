import { ActionIcon, Alert, Group, Stack, Text } from '@mantine/core';
import { resourceCommands } from '@nikkierp/common/dynamicModel';
import { testAttrs } from '@nikkierp/common/utils';
import { Button, Input, LocalizedNumberInput, Modal, Select } from '@nikkierp/ui/components';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { useClientErrorTranslate, useTranslate } from '@nikkierp/ui/i18n';
import { useCommandBus } from '@nikkierp/ui/microApp';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { useActionLock, useOptionalResourceUpdateContext, useResourceFormView } from '@nikkierp/viewkit-mantine';
import { IconTrash } from '@tabler/icons-react';
import React from 'react';
import { z } from 'zod';

import {
	INVENTORY_MODULE, TRACKING_CODE_SCHEMA_NAME, STOCK_MOVE_LINE_SCHEMA_NAME, STOCK_TRANSFER_SCHEMA_NAME,
} from '../../../../constants/inventory';
import { StockTransferCommands } from '../../../../features/inventory/stockTransfer/commands';
import { MOVE_DETAILED_OPERATIONS } from '../../ids';

import type * as dyn from '@nikkierp/common/dynamicModel';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


const TEST_ID = 'inventory.moveDetailedOperations';
const CLOSED_STATUSES = new Set(['done', 'cancelled']);
const PAGE_SIZE = 500;

type MoveRecord = {
	id: string,
	transferId: string,
	variantId: string,
	status: string,
	refresh: () => void,
};

/** One editable line: an existing lot, or the number of a new one, and its quantity. */
type DetailLine = { key: number, lotId: string | null, lotName: string, quantity: number | string };

export const moveDetailedOperationsRenderer: IComponentRenderer<Record<string, never>> = {
	type: MOVE_DETAILED_OPERATIONS,
	propsSchema: z.object({}).strict(),
	render() {
		return (
			<ComponentAnchor id={MOVE_DETAILED_OPERATIONS}>
				<MoveDetailedOperationsAction />
			</ComponentAnchor>
		);
	},
};

function useMoveRecord(): MoveRecord | undefined {
	const update = useOptionalResourceUpdateContext();
	const resource = update?.resource as Record<string, unknown> | undefined;
	const refresh = update?.refresh;
	return React.useMemo(() => {
		if (!refresh || typeof resource?.id !== 'string') {
			return undefined;
		}
		return {
			id: resource.id,
			transferId: String(resource.transfer_id ?? ''),
			variantId: String(resource.product_variant_id ?? ''),
			status: String(resource.status ?? ''),
			refresh,
		};
	}, [resource, refresh]);
}

/**
 * Detailed operations (BR inventory/06 §6.4): which lots or serial numbers the move takes, and how many of
 * each. Shown on a saved, open move and never while its form is being edited, because saving the dialog
 * replaces the move's lines straight away.
 */
function MoveDetailedOperationsAction(): React.ReactNode {
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	const record = useMoveRecord();
	const updateMode = useResourceFormView()?.updateMode ?? false;
	// The backend asserts update on the transfer: the lines are its execution.
	const lock = useActionLock(STOCK_TRANSFER_SCHEMA_NAME, 'update');
	const [opened, setOpened] = React.useState(false);
	if (!record || updateMode || CLOSED_STATUSES.has(record.status)) {
		return null;
	}
	return (
		<>
			<Button
				variant='outline'
				size='compact-sm'
				locked={lock.locked}
				lockedMissing={lock.missing}
				onClick={() => setOpened(true)}
				{...testAttrs(TEST_ID, 'open')}
			>
				{t('actions.set_move_lines', { defaultValue: 'Detailed operations' })}
			</Button>
			{opened ? <DetailedOperationsModal record={record} onClose={() => setOpened(false)} /> : null}
		</>
	);
}

function DetailedOperationsModal({ record, onClose }: { record: MoveRecord, onClose: () => void }): React.ReactNode {
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	const translateError = useClientErrorTranslate([INVENTORY_MODULE, 'common']);
	const lots = useVariantLots(record.variantId);
	const [lines, setLines] = useInitialLines(record.id);
	const save = useCommand(StockTransferCommands.SET_MOVE_LINES);
	const nextKey = React.useRef(1000);
	const patch = (key: number, change: Partial<DetailLine>) => (
		setLines(previous => previous.map(line => (line.key === key ? { ...line, ...change } : line)))
	);
	const submit = async () => {
		const response = await save.publish({
			id: record.transferId,
			move_id: record.id,
			lines: lines.map(line => ({
				lot_id: line.lotId ?? '',
				lot_name: line.lotId ? '' : line.lotName.trim(),
				quantity: String(line.quantity),
			})),
		});
		if (response.error == null && (response.result?.clientErrors ?? []).length === 0) {
			record.refresh();
			onClose();
		}
	};
	return (
		<Modal
			opened
			onClose={onClose}
			title={t('actions.set_move_lines.title', { defaultValue: 'Detailed operations' })}
			size='lg'
			centered
		>
			<Stack gap='sm' {...testAttrs(TEST_ID, 'modal')}>
				<Text size='sm' c='dimmed'>
					{t('move_detailed_operations_hint', {
						defaultValue: 'Pick an existing lot or serial number, or type a new one where the operation allows it.',
					})}
				</Text>
				{lines.map((line, index) => (
					<DetailLineRow
						key={line.key}
						line={line}
						first={index === 0}
						lots={lots}
						onChange={change => patch(line.key, change)}
						onRemove={() => setLines(previous => previous.filter(item => item.key !== line.key))}
					/>
				))}
				<Group>
					<Button
						variant='subtle'
						size='compact-sm'
						onClick={() => setLines(previous => [
							...previous, { key: nextKey.current++, lotId: null, lotName: '', quantity: 1 },
						])}
						{...testAttrs(TEST_ID, 'add')}
					>
						{t('move_detailed_operations_add', { defaultValue: 'Add a line' })}
					</Button>
				</Group>
				{save.clientErrors.length > 0 ? (
					<Alert color='red' variant='light' {...testAttrs(TEST_ID, 'errors')}>
						{save.clientErrors.map((item, index) => <div key={index}>{translateError(item)}</div>)}
					</Alert>
				) : null}
				<Group justify='flex-end'>
					<Button color='gray' onClick={onClose}>{t('common:action.close', { defaultValue: 'Close' })}</Button>
					<Button variant='filled' loading={save.isPending} onClick={() => void submit()} {...testAttrs(TEST_ID, 'save')}>
						{t('common:action.save', { defaultValue: 'Save' })}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}

type Option = { value: string, label: string };

type RowProps = {
	line: DetailLine,
	first: boolean,
	lots: Option[],
	onChange: (change: Partial<DetailLine>) => void,
	onRemove: () => void,
};

/** One line: a lot picked from the variant's, or a new number typed, and its quantity. Labelled on the first row. */
function DetailLineRow({ line, first, lots, onChange, onRemove }: RowProps): React.ReactNode {
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	return (
		<Group align='flex-end' wrap='nowrap' {...testAttrs(TEST_ID, 'line')}>
			<Select
				label={first ? t('fields.lot_id', { defaultValue: 'Lot / serial number' }) : undefined}
				data={lots}
				searchable
				clearable
				value={line.lotId}
				onChange={value => onChange({ lotId: value })}
				{...testAttrs(TEST_ID, 'lot')}
			/>
			<Input.Wrapper
				label={first ? t('move_detailed_operations_new_lot', { defaultValue: 'New number' }) : undefined}
			>
				<Input
					value={line.lotName}
					disabled={Boolean(line.lotId)}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => (
						onChange({ lotName: event.currentTarget.value })
					)}
					{...testAttrs(TEST_ID, 'lotName')}
				/>
			</Input.Wrapper>
			<LocalizedNumberInput
				label={first ? t('fields.quantity', { defaultValue: 'Quantity' }) : undefined}
				min={0}
				value={line.quantity}
				onChange={value => onChange({ quantity: value })}
				{...testAttrs(TEST_ID, 'quantity')}
			/>
			<ActionIcon
				variant='subtle'
				color='red'
				aria-label={t('common:action.delete', { defaultValue: 'Delete' })}
				onClick={onRemove}
				{...testAttrs(TEST_ID, 'remove')}
			>
				<IconTrash size={16} />
			</ActionIcon>
		</Group>
	);
}

/** The lots of the move's variant, as select options. */
function useVariantLots(variantId: string): Option[] {
	const bus = useCommandBus();
	const [options, setOptions] = React.useState<Option[]>([]);
	React.useEffect(() => {
		if (!variantId) {
			return;
		}
		let active = true;
		void bus.publish<dyn.RestSearchResponse<Record<string, unknown>>>({
			name: resourceCommands(TRACKING_CODE_SCHEMA_NAME).SEARCH,
			payload: {
				page: 0, size: PAGE_SIZE, fields: ['id', 'tracking_code'],
				graph: { if: ['product_variant_id', '=', variantId], order: [['tracking_code', 'asc']] },
			},
		}).then((response) => {
			const items = response.result?.data?.items ?? [];
			if (active) {
				setOptions(items.map(item => ({
					value: String(item.id), label: String(item.tracking_code ?? item.id),
				})));
			}
		});
		return () => {
			active = false;
		};
	}, [bus, variantId]);
	return options;
}

/** The move's current lines, as the dialog's starting rows. */
function useInitialLines(moveId: string): [DetailLine[], React.Dispatch<React.SetStateAction<DetailLine[]>>] {
	const bus = useCommandBus();
	const [lines, setLines] = React.useState<DetailLine[]>([]);
	React.useEffect(() => {
		let active = true;
		void bus.publish<dyn.RestSearchResponse<Record<string, unknown>>>({
			name: resourceCommands(STOCK_MOVE_LINE_SCHEMA_NAME).SEARCH,
			payload: {
				page: 0, size: PAGE_SIZE, fields: ['id', 'lot_id', 'lot_name', 'quantity'],
				graph: { if: ['move_id', '=', moveId] },
			},
		}).then((response) => {
			const items = response.result?.data?.items ?? [];
			if (active) {
				setLines(items.map((item, index) => ({
					key: index,
					lotId: item.lot_id ? String(item.lot_id) : null,
					lotName: String(item.lot_name ?? ''),
					quantity: String(item.quantity ?? '0'),
				})));
			}
		});
		return () => {
			active = false;
		};
	}, [bus, moveId]);
	return [lines, setLines];
}
