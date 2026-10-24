import React from 'react';

import { buildTableColumns, findActionColumnConfigErrors } from './actionColumns/actionColumnsModel';
import { useActionColumnLocks } from './actionColumns/useActionColumnLocks';
import { useChangeIndicator } from './changeIndicator/changeIndicator';
import { manualSortLock, searchGraphKey } from './manualSort/manualSortModel';

import type { TableColumn } from './actionColumns/actionColumnsModel';
import type { ActionColumnLocks } from './actionColumns/useActionColumnLocks';
import type { RowCapabilities } from './capabilities';
import type { ExcelDataTableRowFeatureProps } from './capabilities';
import type { ChangeIndicator } from './changeIndicator/changeIndicator';
import type { EditingApi } from './context';
import type { ManualSortLock } from './manualSort/manualSortModel';
import type { RowId, SearchData } from './types';
import type * as dyn from '@nikkierp/common/dynamicModel';


/** The row being dragged by its handle, if any. Lives in the Provider: it freezes the selection. */
export type ManualSortDrag = {
	activeId: RowId | null,
	/** The dragged row's height, so its placeholder keeps the table from jumping. */
	placeholderHeight: number | null,
	start: (id: RowId, height: number | null) => void,
	end: () => void,
};

export function useManualSortDrag(): ManualSortDrag {
	const [state, setState] = React.useState<{ id: RowId | null, height: number | null }>({ id: null, height: null });
	return React.useMemo(() => ({
		activeId: state.id,
		placeholderHeight: state.height,
		start: (id: RowId, height: number | null) => setState({ id, height }),
		end: () => setState({ id: null, height: null }),
	}), [state]);
}

export type ManualSortApi = ManualSortDrag & {
	enabled: boolean,
	/** Why the handles are off, or `null` when a row may be dragged. */
	lock: ManualSortLock | null,
	onSort: ((orderedIds: string[]) => void) | undefined,
};

export type RowFeatures = {
	columns: TableColumn[],
	actionColumnLocks: ActionColumnLocks,
	manualSort: ManualSortApi,
	changes: ChangeIndicator,
	/** `updateScope='table'` and the table may update rows: every row renders its editors. */
	tableEditing: boolean,
};

type RowFeatureDeps = {
	data: SearchData,
	fields: string[],
	isLoading: boolean,
	rows: RowCapabilities,
	editing: EditingApi,
	searchRequest: dyn.RestSearchRequest,
	drag: ManualSortDrag,
	tableName: string,
};

export function useRowFeatures(props: ExcelDataTableRowFeatureProps, deps: RowFeatureDeps): RowFeatures {
	const { actionColumns } = props;
	const { fields, rows, editing, drag } = deps;
	useActionColumnConfigCheck(props, deps.tableName);
	const columns = React.useMemo(() => buildTableColumns(fields, actionColumns), [fields, actionColumns]);
	const actionColumnLocks = useActionColumnLocks(actionColumns);
	const changes = useChangeIndicator({
		enabled: Boolean(props.enableChangeIndicator),
		items: deps.data.items,
		isLoading: deps.isLoading,
		isNewRow: props.isNewRow,
		isChangedRow: props.isChangedRow,
	});
	const [initialGraphKey] = React.useState(() => searchGraphKey(deps.searchRequest.graph));
	const lock = manualSortLock({
		canUpdate: rows.capabilities.includes('update'),
		updateLocked: rows.locks.update.locked,
		isEditing: editing.isActive,
		isSortedOrFiltered: searchGraphKey(deps.searchRequest.graph) !== initialGraphKey,
	});
	const enabled = Boolean(props.enableManualSort);
	const { onManualSort } = props;
	const manualSort = React.useMemo<ManualSortApi>(
		() => ({ ...drag, enabled, lock, onSort: onManualSort }), [drag, enabled, lock, onManualSort],
	);
	const tableEditing = rows.updateScope === 'table' && rows.capabilities.includes('update') && !rows.locks.update.locked;
	return React.useMemo(
		() => ({ columns, actionColumnLocks, manualSort, changes, tableEditing }),
		[columns, actionColumnLocks, manualSort, changes, tableEditing],
	);
}

function useActionColumnConfigCheck(props: ExcelDataTableRowFeatureProps, tableName: string): void {
	const errors = import.meta.env.DEV ? findActionColumnConfigErrors(props.actionColumns) : [];
	if (import.meta.env.DEV && props.enableManualSort && !props.onManualSort) {
		errors.push('enableManualSort needs onManualSort');
	}
	const key = errors.join('\n');
	React.useEffect(() => {
		if (key) {
			console.error(`ExcelDataTable '${tableName}': ${key}`);
		}
	}, [key, tableName]);
}
