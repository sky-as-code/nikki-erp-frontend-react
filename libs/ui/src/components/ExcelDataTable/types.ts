import type { FormProviderRenderProps } from '../form';
import type { EntitlementRequirementInput } from '../PermissionGuard/entitlementContext';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type React from 'react';


export type SearchItem = Record<string, any>;
export type SearchData = dyn.RestSearchResponse<SearchItem>;

export type RowId = string | number;

export type ColumnWidths = Record<string, number>;
export type ResizeState = { field: string, startX: number, startWidth: number };

/**
 * A view mode is any string a page declares through `ViewModeButton mode=`; `list` is the one the
 * table itself renders, every other mode is the page's own container under `ForViewMode`.
 */
export type ExcelViewMode = string;

export const DEFAULT_VIEW_MODE: ExcelViewMode = 'list';

/** Reads the row's record id, falling back to the row index when the record has none. */
export function rowIdOf(item: SearchItem | undefined, rowIndex: number): RowId {
	const id = item?.id;
	return typeof id === 'string' || typeof id === 'number' ? id : rowIndex;
}

/** What a table lets the user do to its rows; none of them means read-only. */
export type ExcelDataTableCapability = 'update' | 'create' | 'delete';

/**
 * Where an inserted row's values come from: typed into one input per column, or picked as an
 * existing record of another resource (an assignment) through a search on one column.
 */
export type NewRowSource = 'user-input' | 'server-resource';

export type NewRowFieldEditorProps = { field: string, form: FormProviderRenderProps };

/** Replaces the default `AutoField` of one column in the insert row. */
export type NewRowFieldEditor = (props: NewRowFieldEditorProps) => React.ReactNode;

/**
 * A page-side sink for a row write, used when no command is given. Resolving `false` reports a
 * failed write, which keeps the row's inputs open.
 */
export type RowValuesSink = (values: Record<string, unknown>) => void | boolean | Promise<void | boolean>;

export type RowsDeletedSink = (items: SearchItem[]) => void | boolean | Promise<void | boolean>;

/**
 * How the table edits rows once it may update them. `row` (the default) opens one row editor at a
 * time, on double-click, Enter or the row's Edit. `table` renders every row's editors at once while
 * the table is in update mode, writing each field as it changes, with no per-row Save.
 */
export type UpdateScope = 'row' | 'table';

export type ActionColumnActionType = 'action' | 'action_link' | 'link';

/** One control of an action column, rendered at size `xs` in list order. */
export type ActionColumnAction = {
	/** Unique within its column; names the control's test id. */
	key: string,
	/** Already translated by the caller. */
	label: string,
	/**
	 * `action`: a `Button` publishing `command` with the row as payload. `action_link`: a `LinkButton`
	 * to `href(row)`. `link`: an `Anchor` to `href(row)`.
	 */
	type: ActionColumnActionType,
	command?: string,
	href?: (row: SearchItem) => string,
	/** Renders the control locked (never hidden) when the caller lacks it; the backend's assertion, verbatim. */
	entitlement?: EntitlementRequirementInput,
	/** A reason (already translated) disables the control and becomes its tooltip; `false` enables it. */
	disabled?: (row: SearchItem) => string | false,
};

/** A column of row controls, placed after `afterField` or, without it, before the built-in action column. */
export type ActionColumn = {
	/** Unique among the table's action columns; also its width key and test id segment. */
	key: string,
	/** Header text, already translated; absent leaves the header blank. */
	label?: string,
	afterField?: string,
	/** Defaults to an estimate from the actions' labels. */
	width?: number,
	actions: ActionColumnAction[],
};
