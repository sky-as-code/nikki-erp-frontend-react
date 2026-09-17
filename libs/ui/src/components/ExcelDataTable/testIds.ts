import { joinTestId, testAttrs } from '@nikkierp/common/utils';

import type { RowId } from './types';
import type { TestIdAttributes } from '@nikkierp/common/utils';


/**
 * Test ids for everything an ExcelDataTable renders that a test can act on.
 *
 * The prefix comes from the consumer's `testId` prop (`{module}.{component}`) and each element
 * appends its own segment. A consumer that has not been threaded yet falls back to `ui.{tableName}`
 * so its ids are still stable and distinct from another table's — but two tables of the same
 * `tableName` on one page would collide, which is what the explicit prop is for.
 *
 * Rows key off the record id rather than the row index, so a test's handle survives sorting,
 * filtering and paging. The index is used only when a record has no id, where nothing stabler
 * exists.
 */
export type ExcelDataTableTestIds = ReturnType<typeof excelDataTableTestIds>;

export function excelDataTableTestIds(testId: string | undefined, tableName: string) {
	const prefix = testId ?? joinTestId('ui', tableName);
	function attrs(...segments: Array<string | number | undefined>): TestIdAttributes {
		return testAttrs(prefix, ...segments);
	}
	return {
		prefix,
		attrs,
		search: () => attrs('search'),
		pagePrev: () => attrs('pagePrev'),
		pageNext: () => attrs('pageNext'),
		pageInput: () => attrs('pageInput'),
		selectedCount: () => attrs('selectedCount'),
		action: (action: DataTableActionIdSource) => attrs('action', actionSegment(action)),
		actionMenu: () => attrs('actionMenu'),
		sort: (field: string) => attrs('sort', field),
		headerMenu: (field: string) => attrs('headerMenu', field),
		headerMenuSort: (field: string, direction: 'asc' | 'desc') =>
			attrs('headerMenu', field, direction),
		columnFilter: (field: string) => attrs('columnFilter', field),
		selectAll: () => attrs('selectAll'),
		row: (rowId: RowId) => attrs('row', rowId),
		rowSelect: (rowId: RowId) => attrs('row', rowId, 'select'),
		rowCell: (rowId: RowId, field: string) => attrs('row', rowId, 'cell', field),
		title: () => attrs('title'),
		refresh: () => attrs('refresh'),
		deselect: () => attrs('deselect'),
		viewMode: (mode: string) => attrs('viewMode', mode),
		viewModeMenu: () => attrs('viewModeMenu'),
		loading: () => attrs('loading'),
		rowEditSave: (rowId: RowId) => attrs('row', rowId, 'save'),
		rowEditDiscard: (rowId: RowId) => attrs('row', rowId, 'discard'),
		rowEditInput: (rowId: RowId, field: string) => attrs('row', rowId, 'input', field),
		...filterTestIds(attrs),
		...settingsTestIds(attrs),
	};
}

type Attrs = (...segments: Array<string | number | undefined>) => TestIdAttributes;

function filterTestIds(attrs: Attrs) {
	return {
		filterToggle: () => attrs('filter', 'toggle'),
		filterPanel: () => attrs('filter', 'panel'),
		filterAddCondition: (field: string) => attrs('filter', 'add', field),
		filterConditionField: (index: number) => attrs('filter', 'condition', index, 'field'),
		filterConditionOperator: (index: number) => attrs('filter', 'condition', index, 'operator'),
		filterConditionValue: (index: number) => attrs('filter', 'condition', index, 'value'),
		filterConditionRemove: (index: number) => attrs('filter', 'condition', index, 'remove'),
		filterConditionJoin: (index: number, join: 'and' | 'or') =>
			attrs('filter', 'condition', index, join),
		filterConditionError: (index: number) => attrs('filter', 'condition', index, 'error'),
		filterSortField: (index: number) => attrs('filter', 'sort', index, 'field'),
		filterSortDirection: (index: number, direction: 'asc' | 'desc') =>
			attrs('filter', 'sort', index, direction),
		filterIncludeArchived: () => attrs('filter', 'includeArchived'),
		filterApply: () => attrs('filter', 'apply'),
		filterClear: () => attrs('filter', 'clear'),
	};
}

function settingsTestIds(attrs: Attrs) {
	return {
		settingsOpen: () => attrs('settings', 'open'),
		settingsTab: (tab: string) => attrs('settings', 'tab', tab),
		settingsFieldsDisplayed: () => attrs('settings', 'fields', 'displayed'),
		settingsFieldsAvailable: () => attrs('settings', 'fields', 'available'),
		settingsFieldsAdd: () => attrs('settings', 'fields', 'add'),
		settingsFieldsRemove: () => attrs('settings', 'fields', 'remove'),
		settingsFieldsUp: () => attrs('settings', 'fields', 'up'),
		settingsFieldsDown: () => attrs('settings', 'fields', 'down'),
		settingsPageSize: () => attrs('settings', 'pageSize'),
		settingsViewMode: (mode: string) => attrs('settings', 'viewMode', mode),
		settingsApply: () => attrs('settings', 'apply'),
		settingsCancel: () => attrs('settings', 'cancel'),
	};
}


type DataTableActionIdSource = { testId?: string, command?: string, label?: string };

/**
 * Names an action by the most stable thing it carries: an explicit id, else the command it
 * publishes, else its label. A label is a translated string, so it is the last resort.
 */
function actionSegment(action: DataTableActionIdSource): string | undefined {
	return action.testId ?? action.command ?? action.label;
}

