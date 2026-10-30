import { Badge } from '@mantine/core';
import React from 'react';

import { useTranslate } from '../../../i18n';
import { useExcelDataTableContext } from '../context';

import type { RowChangeMark } from './changeIndicator';
import type { RowId, SearchItem } from '../types';


const badgeText = {
	new: { key: 'datatable.rowNew', defaultValue: 'New', color: 'teal' },
	changed: { key: 'datatable.rowChanged', defaultValue: 'Changed', color: 'yellow' },
} as const;

type RowChangeBadgeProps = { item: SearchItem, rowId: RowId };

/** The row's "New" or "Changed" badge, or nothing when it has neither or the indicator is off. */
export function RowChangeBadge({ item, rowId }: RowChangeBadgeProps): React.ReactNode {
	const { changes, tid } = useExcelDataTableContext();
	const t = useTranslate('common');
	const mark = useGroupMark(item, rowId) ?? changes.markOf(item, rowId);
	if (!mark) {
		return null;
	}
	const text = badgeText[mark];
	return (
		<Badge size='xs' variant='light' color={text.color} className='flex-none' {...tid.rowChangeBadge(rowId)}>
			{t(text.key, { defaultValue: text.defaultValue })}
		</Badge>
	);
}

/**
 * In a grouped table a badge drawn in a group cell (the index, or a group field first) stands for
 * the whole group: "New" when any of its rows is, else "Changed" when any is (§5.11).
 */
function useGroupMark(item: SearchItem, rowId: RowId): RowChangeMark | null | undefined {
	const { changes, rowSpan } = useExcelDataTableContext();
	const slot = useChangeBadgeSlot();
	const place = rowSpan?.places.get(rowId);
	if (!rowSpan || !place || !slot || rowSpan.config.nestedFields.includes(slot)) {
		return undefined;
	}
	const group = rowSpan.groups.find(entry => entry.groupId === place.groupId);
	const marks = (group?.rowIds ?? [rowId]).map(id => changes.markOf(rowSpan.rowsById.get(id) ?? item, id));
	return marks.find(mark => mark === 'new') ?? marks.find(mark => mark === 'changed') ?? null;
}

/**
 * Where the badge goes: `index` for the index cell, or the first field's column key when the index
 * column is hidden; `null` while the indicator is off.
 */
export function useChangeBadgeSlot(): string | null {
	const { changes, indexColumnVisible, fields } = useExcelDataTableContext();
	if (!changes.enabled) {
		return null;
	}
	return indexColumnVisible ? CHANGE_BADGE_INDEX_SLOT : (fields[0] ?? null);
}

export const CHANGE_BADGE_INDEX_SLOT = '@index';
