import { Alert, Stack } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useHasEntitlement } from '@nikkierp/ui/components';
import { ExcelDataTable } from '@nikkierp/ui/components/ExcelDataTable';
import { useCrudFormRuntime } from '@nikkierp/ui/components/form';
import { useClientErrorTranslate, useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { actionRequirement, useDetailSavePayload, useResourceFormView } from '@nikkierp/viewkit-mantine';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { useParams } from 'react-router';
import { z } from 'zod';

import { useSavedMoveGroups } from './moveData';
import { isDraftMoveRow, isEditedMoveRow, mapMoveErrors, mergeDraftMoveRows, withTemplateRule } from './moveDrafts';
import { useMoveDraftState } from './moveDraftState';
import { MOVE_FIELD_EDITORS, MOVES_TEST_ID_PREFIX } from './moveEditors';
import {
	ATTRIBUTES_FIELD, MOVE_EDGE_LABELS, MOVE_GROUP_COLUMNS, MOVE_GROUP_SCHEMA, TEMPLATE_FIELD, withMoveLabels,
} from './moveGroups';
import { MoveOptionsContext, useMoveOptionLoaders } from './moveOptions';
import {
	INVENTORY_MODULE, PRODUCT_TEMPLATE_SCHEMA_NAME, STOCK_MOVE_SCHEMA_NAME,
} from '../../../../constants/inventory';
import { STOCK_TRANSFER_MOVES } from '../../ids';
import { useAttributeCatalogue } from '../templateAttributes/attributeCatalogue';

import type { MoveErrors } from './moveDrafts';
import type { MoveDraftState } from './moveDraftState';
import type { ClientErrorItem } from '@nikkierp/common/types';
import type { EntitlementRequirementInput } from '@nikkierp/ui/components';
import type { ExcelDataTableCapability, SearchData, SearchItem } from '@nikkierp/ui/components/ExcelDataTable';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';
import type { DetailSavePayload } from '@nikkierp/viewkit-mantine';
import type { Control } from 'react-hook-form';


const CAPABILITIES: ExcelDataTableCapability[] = ['create', 'update', 'delete'];
const STATUS_FIELD = 'status';
const DRAFT_STATUS = 'draft';
const NO_ATTRIBUTES: string[] = [];

/** The moves ride the transfer's own write; the backend also asserts the matching move action. */
const CREATE_REQUIREMENT = actionRequirement(STOCK_MOVE_SCHEMA_NAME, 'create');
const UPDATE_REQUIREMENT = actionRequirement(STOCK_MOVE_SCHEMA_NAME, 'update');
const DELETE_REQUIREMENT = actionRequirement(STOCK_MOVE_SCHEMA_NAME, 'delete');
/** A move named by template and attributes may materialize a variant, which the backend also asserts. */
const GENERATE_REQUIREMENT = actionRequirement(PRODUCT_TEMPLATE_SCHEMA_NAME, 'generate_variants');

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
 * The transfer's moves, one group per move: its product template spanning the attribute values that
 * pick the variant, with its demand and unit. While the form is created or updated, and only while the
 * transfer is a draft, every group edits inline and each write only drafts a change; all of it rides
 * the transfer's own create or update request on Save, in one transaction, and the backend resolves or
 * materializes each move's variant. Cancel or a successful Save discards the drafts and re-reads.
 */
function StockTransferMovesSection({ save, control }: SectionProps): React.ReactNode {
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	const status = useWatch({ control, name: STATUS_FIELD }) as unknown;
	// The backend refuses a change to the moves once the transfer has left draft.
	const editable = save.mode === 'create' || status === DRAFT_STATUS;
	const section = useMovesSection(save);
	const loaders = useMoveOptionLoaders();
	const locks = useWriteRequirements();
	return (
		<Stack gap='xs' {...testAttrs(MOVES_TEST_ID_PREFIX)}>
			<MoveSaveErrors errors={section.errors} rowLabel={section.rowLabel} />
			<MoveOptionsContext.Provider value={loaders}>
				<ExcelDataTable.Provider
					key={section.loadCount}
					tableName='stockTransferMoves'
					modelSchema={MOVE_GROUP_SCHEMA}
					data={section.data}
					isLoading={section.isLoading}
					rowSpanField={TEMPLATE_FIELD}
					rowSingleField={ATTRIBUTES_FIELD}
					indexColumnVisible={false}
					selectionMode='none'
					capabilities={editable ? CAPABILITIES : []}
					updateMode={editable && section.updateMode}
					updateScope='table'
					enableChangeIndicator
					isNewRow={isDraftMoveRow}
					isChangedRow={section.isChangedRow}
					fieldEditors={MOVE_FIELD_EDITORS}
					newRowPrompt={t('stock_transfer_moves_add_product', { defaultValue: 'Add new product' })}
					subRowPrompt={t('stock_transfer_moves_add_attribute', { defaultValue: 'Add attribute' })}
					onCreated={section.onCreated}
					onUpdated={section.onUpdated}
					onDeleted={section.onDeleted}
					{...locks}
					emptyMessage={t('stock_transfer_moves_empty', { defaultValue: 'No moves yet' })}
					testId={MOVES_TEST_ID_PREFIX}

				>
					<ExcelDataTable.TableHeader enableColumnFilters={false} />
					<ExcelDataTable.Table />
				</ExcelDataTable.Provider>
			</MoveOptionsContext.Provider>
		</Stack>
	);
}

/**
 * A template-form move needs `generate_variants` on templates as well as the move grant, so without
 * it adding and changing moves render locked on that grant; removing a move does not need it.
 */
function useWriteRequirements(): Record<'createEntitlement' | 'updateEntitlement' | 'deleteEntitlement',
	EntitlementRequirementInput> {
	const decision = useHasEntitlement([GENERATE_REQUIREMENT]);
	const canGenerate = decision.isPending || decision.results[0]?.allowed !== false;
	return {
		createEntitlement: canGenerate ? CREATE_REQUIREMENT : GENERATE_REQUIREMENT,
		updateEntitlement: canGenerate ? UPDATE_REQUIREMENT : GENERATE_REQUIREMENT,
		deleteEntitlement: DELETE_REQUIREMENT,
	};
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
		...useDraftSinks(draftState, rows.items, saved.groups),
	};
}

/** The saved groups with their drafts merged, labelled for read cells, as the table's data. */
function useShownGroups(saved: ReturnType<typeof useSavedMoveGroups>, draftState: MoveDraftState) {
	const catalogue = useAttributeCatalogue(NO_ATTRIBUTES);
	const { drafts } = draftState;
	const items = React.useMemo(() => withMoveLabels(mergeDraftMoveRows(saved.groups, drafts), {
		templateNames: saved.templateNames,
		attributeNames: new Map([...catalogue.attributes].map(([id, attribute]) => [id, attribute.name])),
	}), [saved.groups, saved.templateNames, drafts, catalogue.attributes]);
	const data = React.useMemo((): SearchData => ({
		items, total: items.length, page: 0, size: Math.max(items.length, 1), desired_fields: MOVE_GROUP_COLUMNS,
		masked_fields: [], schema_etag: '', edge_labels: { ...MOVE_EDGE_LABELS, ...saved.edgeLabels },
	} as SearchData), [items, saved.edgeLabels]);
	return { items, data };
}

const NO_ERRORS: MoveErrors = { byRow: {}, general: [] };

/** The table's group writes, as drafts. Another template drops the group's attributes. */
function useDraftSinks(draftState: MoveDraftState, shown: SearchItem[], savedGroups: SearchItem[]) {
	const onCreated = (values: Record<string, unknown>): boolean => {
		draftState.add(values);
		return true;
	};
	const onUpdated = (values: Record<string, unknown>): boolean => {
		const previous = shown.find(group => group.id === values.id);
		draftState.update(withTemplateRule(values, previous), savedGroups.find(group => group.id === values.id));
		return true;
	};
	// The table deletes one group at a time.
	const onDeleted = (items: SearchItem[]) => items.forEach(item => draftState.remove(item));
	return { onCreated, onUpdated, onDeleted };
}

/**
 * Every rejection of the delta, group errors named by their line. The page's own error area cannot
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
