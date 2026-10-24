import type { ActionColumn, ColumnWidths } from '../types';


/**
 * One displayed column between the index (and sort handle) column and the built-in action column:
 * a schema field, or a custom action column. `key` is what the `<colgroup>`, the header and the
 * filter row are keyed by; an action column's key can never be a field name.
 */
export type TableColumn =
	| { kind: 'field', key: string, field: string }
	| { kind: 'action', key: string, column: ActionColumn };

export function actionColumnKey(columnKey: string): string {
	return `@action:${columnKey}`;
}

/**
 * The fields in order, each action column right after its `afterField` (several after one field keep
 * their list order); one without `afterField`, or naming a field not displayed, goes last, which is
 * just before the built-in action column.
 */
export function buildTableColumns(fields: string[], actionColumns: ActionColumn[] | undefined): TableColumn[] {
	const columns: TableColumn[] = [];
	const placed = new Set<ActionColumn>();
	const toColumn = (column: ActionColumn): TableColumn => ({ kind: 'action', key: actionColumnKey(column.key), column });
	for (const field of fields) {
		columns.push({ kind: 'field', key: field, field });
		for (const column of actionColumns ?? []) {
			if (column.afterField === field) {
				columns.push(toColumn(column));
				placed.add(column);
			}
		}
	}
	for (const column of actionColumns ?? []) {
		if (!placed.has(column)) {
			columns.push(toColumn(column));
		}
	}
	return columns;
}

const characterPixelWidth = 7;
const buttonPadding = 26;
const controlGap = 8;
const cellPadding = 20;
const minimumActionColumnWidth = 64;

/** An xs control per action, side by side, with the cell's padding; `width` wins when given. */
export function getActionColumnWidth(column: ActionColumn): number {
	if (column.width) {
		return column.width;
	}
	const controls = column.actions.reduce((sum, action) => sum + (action.label.length * characterPixelWidth)
		+ (action.type === 'link' ? 0 : buttonPadding), 0);
	const gaps = Math.max(0, column.actions.length - 1) * controlGap;
	return Math.max(minimumActionColumnWidth, controls + gaps + cellPadding);
}

/** The action columns' widths under the user's resized ones, keyed like the colgroup. */
export function withActionColumnWidths(columns: TableColumn[], widths: ColumnWidths): ColumnWidths {
	const merged: ColumnWidths = {};
	for (const column of columns) {
		if (column.kind === 'action') {
			merged[column.key] = getActionColumnWidth(column.column);
		}
	}
	return { ...merged, ...widths };
}

/** Misconfigurations a page cannot see until a user clicks; reported in development only. */
export function findActionColumnConfigErrors(actionColumns: ActionColumn[] | undefined): string[] {
	const errors: string[] = [];
	const columnKeys = new Set<string>();
	for (const column of actionColumns ?? []) {
		if (columnKeys.has(column.key)) {
			errors.push(`action column '${column.key}' is declared twice`);
		}
		columnKeys.add(column.key);
		for (const action of column.actions) {
			if (action.type === 'action' && !action.command) {
				errors.push(`action '${column.key}.${action.key}' needs a command`);
			}
			if (action.type !== 'action' && !action.href) {
				errors.push(`${action.type} '${column.key}.${action.key}' needs href`);
			}
		}
	}
	return errors;
}
