import { columnFieldNames } from '../resourceDetail/formColumnFields';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** Whether a column field reaches through a to-one edge (`setting.ui_mode`): read-only, from the detail read. */
export function isDottedField(field: string): boolean {
	return field.includes('.');
}

/**
 * Every `edge.leaf` field the page's column blocks list, deduplicated and sorted: the detail read adds them to
 * `fields=` (with `*`), since a plain read selects only the record's own fields. Columns are found anywhere in the
 * tree, under `children` or a prop holding nodes (a tab's).
 */
export function dottedColumnFields(nodes: readonly ComponentNode[] | undefined): string[] {
	const found = new Set<string>();
	const visit = (value: unknown): void => {
		if (Array.isArray(value)) {
			value.forEach(visit);
			return;
		}
		if (!isComponentNode(value)) {
			return;
		}
		const fields = columnFieldNames(value.props?.fields as unknown[] | undefined);
		fields.filter(isDottedField).forEach(field => found.add(field));
		Object.values(value.props ?? {}).forEach(visit);
		visit(value.children);
	};
	visit(nodes);
	return [...found].sort();
}

function isComponentNode(value: unknown): value is ComponentNode {
	return typeof value === 'object' && value !== null && (value as Partial<ComponentNode>).type === 'component';
}
