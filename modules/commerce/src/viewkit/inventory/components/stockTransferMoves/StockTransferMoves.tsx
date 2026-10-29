import { Alert, Stack } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { RelationSearchScopeContext, useCrudFormRuntime } from '@nikkierp/ui/components/form';
import { useClientErrorTranslate, useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import {
	actionRequirement, FormDataTable, useDetailSavePayload, useResourceFormView,
} from '@nikkierp/viewkit-mantine';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { useParams } from 'react-router';
import { z } from 'zod';

import {
	isDraftMoveRow, isEditedMoveRow, mapMoveErrors, mergeDraftMoveRows, MOVE_COLUMNS, VARIANT_FIELD,
} from './moveDrafts';
import { useMoveDraftState } from './moveDraftState';
import { INVENTORY_MODULE, STOCK_MOVE_SCHEMA_NAME } from '../../../../constants/inventory';
import { STOCK_TRANSFER_MOVES } from '../../ids';

import type { MoveErrors } from './moveDrafts';
import type { MoveDraftState } from './moveDraftState';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { ClientErrorItem } from '@nikkierp/common/types';
import type { ExcelDataTableCapability, SearchItem } from '@nikkierp/ui/components/ExcelDataTable';
import type { RecordSearchScope } from '@nikkierp/ui/components/form';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';
import type { DetailSavePayload } from '@nikkierp/viewkit-mantine';
import type { Control } from 'react-hook-form';


const TEST_ID_PREFIX = 'inventory.stockTransferMoves';
const CAPABILITIES: ExcelDataTableCapability[] = ['create', 'update', 'delete'];
const MOVE_ORDER: dyn.OrderBy = [['sequence', 'asc']];
/** A new transfer has no moves yet. Every row has an id, so this matches nothing. */
const NO_SAVED_MOVES: dyn.SearchGraph = { if: ['id', 'not_set'] };
const STATUS_FIELD = 'status';
const DRAFT_STATUS = 'draft';

/**
 * A variant's record label is a function-computed display name the server cannot filter on; the
 * user looks a product up by its template's name, which is.
 */
const MOVE_SEARCH_SCOPES: Record<string, RecordSearchScope> = {
	[VARIANT_FIELD]: { searchField: 'product_template_name' },
};

/** The moves ride the transfer's own write; the backend also asserts the matching move action. */
const CREATE_REQUIREMENT = actionRequirement(STOCK_MOVE_SCHEMA_NAME, 'create');
const UPDATE_REQUIREMENT = actionRequirement(STOCK_MOVE_SCHEMA_NAME, 'update');
const DELETE_REQUIREMENT = actionRequirement(STOCK_MOVE_SCHEMA_NAME, 'delete');

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
 * The transfer's moves. While the form is created or updated, and only while the transfer is a
 * draft, every row edits inline and each write only drafts a change: added rows show "New", edited
 * ones "Changed", a deleted saved move leaves the view, and all of it rides the transfer's own
 * create or update request on Save, in one transaction. Cancel or a successful Save discards the
 * drafts; a rejected save keeps them and lists every error above the table.
 */
function StockTransferMovesSection({ save, control }: SectionProps): React.ReactNode {
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	const status = useWatch({ control, name: STATUS_FIELD }) as unknown;
	// The backend refuses a change to the moves once the transfer has left draft.
	const editable = save.mode === 'create' || status === DRAFT_STATUS;
	const section = useMovesSection(save);
	return (
		<Stack gap='xs' {...testAttrs(TEST_ID_PREFIX)}>
			<MoveSaveErrors errors={section.errors} rowLabel={section.rowLabel} />
			<RelationSearchScopeContext.Provider value={MOVE_SEARCH_SCOPES}>
				<FormDataTable
					key={section.loadCount}
					schemaName={STOCK_MOVE_SCHEMA_NAME}
					baseGraph={section.baseGraph}
					fields={MOVE_COLUMNS}
					transformItems={section.transformItems}
					capabilities={editable ? CAPABILITIES : []}
					updateMode={editable ? undefined : false}
					updateScope='table'
					enableChangeIndicator
					isNewRow={isDraftMoveRow}
					isChangedRow={section.isChangedRow}
					newRowPrompt={t('stock_transfer_moves_add', { defaultValue: 'Add a move' })}
					onCreated={section.onCreated}
					onUpdated={section.onUpdated}
					onDeleted={section.onDeleted}
					createEntitlement={CREATE_REQUIREMENT}
					updateEntitlement={UPDATE_REQUIREMENT}
					deleteEntitlement={DELETE_REQUIREMENT}
					emptyMessage={t('stock_transfer_moves_empty', { defaultValue: 'No moves yet' })}
					testId={TEST_ID_PREFIX}
				/>
			</RelationSearchScopeContext.Provider>
		</Stack>
	);
}

function useMovesSection(save: DetailSavePayload) {
	const routeId = useParams().id ?? '';
	const transferId = save.mode === 'create' ? '' : routeId;
	const updateMode = useResourceFormView()?.updateMode ?? true;
	// A save re-reads the rows: the table remounts and runs its search again.
	const [loadCount, setLoadCount] = React.useState(0);
	const baseGraph = React.useMemo((): dyn.SearchGraph => (transferId
		? { if: ['transfer_id', '=', transferId], order: MOVE_ORDER }
		: NO_SAVED_MOVES), [transferId]);
	const draftState = useMoveDraftState({
		transferId, save, updateMode, onSaved: () => setLoadCount(count => count + 1),
	});
	const { drafts, sent } = draftState;
	// The rows as last shown, so an error can name the line it points at; removed ones by id.
	const shownRows = React.useRef<string[]>([]);
	const transformItems = React.useCallback((items: SearchItem[]) => {
		const rows = mergeDraftMoveRows(items, drafts);
		shownRows.current = rows.map(row => String(row.id));
		return rows;
	}, [drafts]);
	const isChangedRow = React.useCallback((row: SearchItem) => isEditedMoveRow(row, drafts), [drafts]);
	// `sent` is written by the save's build, just before the request whose errors arrive here.
	const errors = React.useMemo(
		() => (updateMode ? mapMoveErrors(save.saveClientErrors, sent.current) : NO_ERRORS),
		[save.saveClientErrors, updateMode, sent],
	);
	const rowLabel = React.useCallback((rowId: string): number | undefined => {
		const index = shownRows.current.indexOf(rowId);
		return index >= 0 ? index + 1 : undefined;
	}, []);
	return { baseGraph, loadCount, transformItems, isChangedRow, errors, rowLabel, ...useDraftSinks(draftState) };
}

const NO_ERRORS: MoveErrors = { byRow: {}, general: [] };

/** The table's row writes, as drafts. */
function useDraftSinks(draftState: MoveDraftState) {
	const onCreated = (values: Record<string, unknown>): boolean => {
		draftState.add(values);
		return true;
	};
	const onUpdated = (values: Record<string, unknown>): boolean => {
		draftState.update(values);
		return true;
	};
	// The table deletes one row at a time.
	const onDeleted = (items: SearchItem[]) => items.forEach(item => draftState.remove(item));
	return { onCreated, onUpdated, onDeleted };
}

/**
 * Every rejection of the delta, row errors named by their line. The page's own error area cannot show
 * them: it pins field errors on the inputs of that name, and no input is named `moves.*`.
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
		<Alert variant='light' color='red' {...testAttrs(TEST_ID_PREFIX, 'errors')}>
			{lines.map((line, index) => <div key={index}>{line}</div>)}
		</Alert>
	);
}
