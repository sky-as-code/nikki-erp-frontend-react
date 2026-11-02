import { Alert, Stack } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { ExcelDataTable } from '@nikkierp/ui/components/ExcelDataTable';
import { RelationSearchScopeContext, useCrudFormRuntime } from '@nikkierp/ui/components/form';
import { useClientErrorTranslate, useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import {
	actionRequirement, useDetailSavePayload, useResourceFormView, useRoutePathHref,
} from '@nikkierp/viewkit-mantine';
import { IconInfoCircle } from '@tabler/icons-react';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { useParams } from 'react-router';
import { z } from 'zod';

import { useSavedMoveGroups, useVariantNames } from './moveData';
import { isDraftMoveRow, isEditedMoveRow, mapMoveErrors, mergeDraftMoveRows } from './moveDrafts';
import { useMoveDraftState } from './moveDraftState';
import {
	MOVE_EDGE_LABELS, MOVE_GROUP_COLUMNS, MOVE_GROUP_SCHEMA, MOVE_VARIANT_SEARCH_SCOPE, MOVES_TEST_ID_PREFIX,
	unlabelledVariantIds, withVariantLabels,
} from './moveGroups';
import { INVENTORY_MODULE, STOCK_MOVE_SCHEMA_NAME, STOCK_TRANSFER_SCHEMA_NAME } from '../../../../constants/inventory';
import { STOCK_TRANSFER_MOVES } from '../../ids';

import type { MoveErrors } from './moveDrafts';
import type { MoveDraftState } from './moveDraftState';
import type { ClientErrorItem } from '@nikkierp/common/types';
import type { ExcelDataTableCapability, SearchData, SearchItem } from '@nikkierp/ui/components/ExcelDataTable';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';
import type { DetailSavePayload } from '@nikkierp/viewkit-mantine';
import type { Control } from 'react-hook-form';


const CAPABILITIES: ExcelDataTableCapability[] = ['create', 'update', 'delete'];
const STATUS_FIELD = 'status';
const DRAFT_STATUS = 'draft';
const VARIANT_HINT = 'Cannot find the product variant you want? Go to Product detail page and press '
	+ '"Resolve variant" to generate it.';
/** From the transfer detail's own route (`…/:id`), so `:id` is the transfer. */
// Absolute, naming Commerce, so a move row still reaches Inventory's own move page when another
// module (Vending Machine) renders this node on its proxy transfer page.
const MOVE_LIST_ROUTE_PATH = `/commerce/${STOCK_TRANSFER_SCHEMA_NAME}/:id/${STOCK_MOVE_SCHEMA_NAME}`;

/** The moves ride the transfer's own write; the backend also asserts the matching move action. */
const WRITE_REQUIREMENTS = {
	createEntitlement: actionRequirement(STOCK_MOVE_SCHEMA_NAME, 'create'),
	updateEntitlement: actionRequirement(STOCK_MOVE_SCHEMA_NAME, 'update'),
	deleteEntitlement: actionRequirement(STOCK_MOVE_SCHEMA_NAME, 'delete'),
};

export const stockTransferMovesRenderer: IComponentRenderer<Record<string, never>> = {
	type: STOCK_TRANSFER_MOVES,
	propsSchema: z.object({}).strict(),
	render() {
		return (
			<ComponentAnchor id={STOCK_TRANSFER_MOVES}>
				<StockTransferMovesGuard />
			</ComponentAnchor>
		);
	},
};

/** The section needs the transfer form (for `status`) and its save; outside one it renders nothing. */
function StockTransferMovesGuard(): React.ReactNode {
	const save = useDetailSavePayload();
	const runtime = useCrudFormRuntime();
	if (!save || !runtime) {
		return null;
	}
	return <StockTransferMovesSection save={save} control={runtime.form.control} />;
}

type SectionProps = { save: DetailSavePayload, control: Control<any> };

/**
 * The transfer's moves, one row per move: its product variant, demand and unit. While the form is created
 * or updated, and only while the transfer is a draft, every row edits inline and each write only drafts a
 * change; all of it rides the transfer's own create or update request on Save, in one transaction. Cancel or
 * a successful Save discards the drafts and re-reads. The hint names no link: following one would discard
 * the edits.
 */
function StockTransferMovesSection({ save, control }: SectionProps): React.ReactNode {
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	const status = useWatch({ control, name: STATUS_FIELD }) as unknown;
	// The backend refuses a change to the moves once the transfer has left draft.
	const editable = save.mode === 'create' || status === DRAFT_STATUS;
	const section = useMovesSection(save);
	const editing = editable && section.updateMode;
	const buildLinkHref = useMoveLinkHref(editing);
	return (
		<Stack gap='xs' {...testAttrs(MOVES_TEST_ID_PREFIX)}>
			<MoveSaveErrors errors={section.errors} rowLabel={section.rowLabel} />
			{editing && (
				<Alert color='blue' icon={<IconInfoCircle />} {...testAttrs(MOVES_TEST_ID_PREFIX, 'variantHint')}>
					{t('stock_transfer_moves_variant_hint', { defaultValue: VARIANT_HINT })}
				</Alert>
			)}
			<RelationSearchScopeContext.Provider value={MOVE_VARIANT_SEARCH_SCOPE}>
				<ExcelDataTable.Provider
					key={section.loadCount}
					tableName='stockTransferMoves'
					modelSchema={MOVE_GROUP_SCHEMA}
					localModelSchema
					data={section.data}
					isLoading={section.isLoading}
					indexColumnVisible={false}
					selectionMode='none'
					capabilities={editable ? CAPABILITIES : []}
					updateMode={editing}
					updateScope='table'
					enableChangeIndicator
					isNewRow={isDraftMoveRow}
					isChangedRow={section.isChangedRow}
					buildLinkHref={buildLinkHref}
					newRowPrompt={t('stock_transfer_moves_add_product', { defaultValue: 'Add new product' })}
					onCreated={section.onCreated}
					onUpdated={section.onUpdated}
					onDeleted={section.onDeleted}
					{...WRITE_REQUIREMENTS}
					emptyMessage={t('stock_transfer_moves_empty', { defaultValue: 'No moves yet' })}
					testId={MOVES_TEST_ID_PREFIX}
				>
					<ExcelDataTable.TableHeader enableColumnFilters={false} />
					<ExcelDataTable.Table />
				</ExcelDataTable.Provider>
			</RelationSearchScopeContext.Provider>
		</Stack>
	);
}

/**
 * A saved move's row links to its detail page, under the transfer. None while the moves are edited (following
 * it would discard the edits) and none for a drafted move, which has no page yet.
 */
function useMoveLinkHref(editing: boolean): ((row: SearchItem) => string) | undefined {
	const baseHref = useRoutePathHref(MOVE_LIST_ROUTE_PATH);
	return React.useMemo(() => {
		if (editing || !baseHref) {
			return undefined;
		}
		return (row: SearchItem) => (isDraftMoveRow(row) ? '' : `${baseHref}/${encodeURIComponent(String(row.id))}`);
	}, [editing, baseHref]);
}

function useMovesSection(save: DetailSavePayload) {
	const routeId = useParams().id ?? '';
	const transferId = save.mode === 'create' ? '' : routeId;
	const updateMode = useResourceFormView()?.updateMode ?? true;
	// A save re-reads the rows: the table remounts and the moves are read again.
	const [loadCount, setLoadCount] = React.useState(0);
	const saved = useSavedMoveGroups(transferId, loadCount);
	const draftState = useMoveDraftState({
		transferId, save, updateMode, onSaved: () => setLoadCount(count => count + 1),
	});
	const { drafts, sent } = draftState;
	const rows = useShownGroups(saved, draftState);
	const isChangedRow = React.useCallback((row: SearchItem) => isEditedMoveRow(row, drafts), [drafts]);
	// `sent` is written by the save's build, just before the request whose errors arrive here.
	const errors = React.useMemo(
		() => (updateMode ? mapMoveErrors(save.saveClientErrors, sent.current) : NO_ERRORS),
		[save.saveClientErrors, updateMode, sent],
	);
	const rowLabel = React.useCallback((rowId: string): number | undefined => {
		const index = rows.items.findIndex(row => String(row.id) === rowId);
		return index >= 0 ? index + 1 : undefined;
	}, [rows.items]);
	return {
		loadCount, updateMode, data: rows.data, isLoading: saved.isLoading, isChangedRow, errors, rowLabel,
		...useDraftSinks(draftState, saved.groups),
	};
}

/** The saved moves with their drafts merged, labelled for read cells, as the table's data. */
function useShownGroups(saved: ReturnType<typeof useSavedMoveGroups>, draftState: MoveDraftState) {
	const { drafts } = draftState;
	const merged = React.useMemo(() => mergeDraftMoveRows(saved.groups, drafts), [saved.groups, drafts]);
	const names = useVariantNames(React.useMemo(() => unlabelledVariantIds(merged), [merged]));
	const items = React.useMemo(() => withVariantLabels(merged, names), [merged, names]);
	const data = React.useMemo((): SearchData => ({
		items, total: items.length, page: 0, size: Math.max(items.length, 1), desired_fields: MOVE_GROUP_COLUMNS,
		masked_fields: [], schema_etag: '', edge_labels: { ...MOVE_EDGE_LABELS, ...saved.edgeLabels },
	} as SearchData), [items, saved.edgeLabels]);
	return { items, data };
}

const NO_ERRORS: MoveErrors = { byRow: {}, general: [] };

/** The table's move writes, as drafts. */
function useDraftSinks(draftState: MoveDraftState, savedGroups: SearchItem[]) {
	const onCreated = (values: Record<string, unknown>): boolean => {
		draftState.add(values);
		return true;
	};
	const onUpdated = (values: Record<string, unknown>): boolean => {
		draftState.update(values, savedGroups.find(group => group.id === values.id));
		return true;
	};
	// The table deletes one move at a time.
	const onDeleted = (items: SearchItem[]) => items.forEach(item => draftState.remove(item));
	return { onCreated, onUpdated, onDeleted };
}

/**
 * Every rejection of the delta, move errors named by their line. The page's own error area cannot
 * show them: it pins field errors on the inputs of that name, and no input is named `moves.*`.
 */
function MoveSaveErrors({ errors, rowLabel }: {
	errors: MoveErrors,
	rowLabel: (rowId: string) => number | undefined,
}): React.ReactNode {
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	const translateError = useClientErrorTranslate([INVENTORY_MODULE, 'common']);
	const lineOf = (rowId: string, items: ClientErrorItem[]) => {
		const line = rowLabel(rowId);
		const label = line === undefined
			? rowId
			: t('stock_transfer_moves_line', { line, defaultValue: 'Line {{line}}' });
		return items.map(item => `${label}: ${translateError(item)}`);
	};
	const lines = [
		...errors.general.map(item => translateError(item)),
		...Object.entries(errors.byRow).flatMap(([rowId, items]) => lineOf(rowId, items)),
	];
	if (lines.length === 0) {
		return null;
	}
	return (
		<Alert variant='light' color='red' {...testAttrs(MOVES_TEST_ID_PREFIX, 'errors')}>
			{lines.map((line, index) => <div key={index}>{line}</div>)}
		</Alert>
	);
}
