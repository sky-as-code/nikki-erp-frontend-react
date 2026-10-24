import { Badge } from '@mantine/core';
import React from 'react';

import { useTranslate } from '../../../i18n';
import { useExcelDataTableContext } from '../context';

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
	const mark = changes.markOf(item, rowId);
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
