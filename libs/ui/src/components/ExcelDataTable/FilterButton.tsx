import { IconChevronDown, IconChevronUp, IconFilter } from '@tabler/icons-react';
import React from 'react';

import { useExcelDataTableContext } from './context';
import { useTranslate } from '../../i18n';
import { Button } from '../Button';


/**
 * Toggles the filter panel. Reads `[filter] Filters` and `[filter] Filters (n)` with active
 * conditions; on a compact screen the label drops and only `(n)` remains beside the icon.
 */
export function FilterButton() {
	const t = useTranslate('common');
	const { filters, filterPane, isCompact, tid } = useExcelDataTableContext();
	const count = filters.activeCount;
	const label = t('search.filters');
	const countText = count > 0 ? `(${count})` : '';
	const text = isCompact ? countText : [label, countText].filter(Boolean).join(' ');
	const chevron = filterPane.isOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />;
	// Compact with no active filters leaves no text at all. Mantine still lays out the gap after
	// `leftSection` when the label is an empty string, which reads as a lopsided icon button — so
	// the icon becomes the whole content instead of a section beside nothing.
	const iconOnly = text === '';
	return (
		<Button
			variant={filterPane.isOpen || count > 0 ? 'light' : 'default'}
			onClick={filterPane.toggle}
			leftSection={iconOnly ? undefined : <IconFilter size={16} />}
			rightSection={isCompact ? undefined : chevron}
			aria-label={isCompact ? label : undefined}
			aria-expanded={filterPane.isOpen}
			{...tid.filterToggle()}
		>
			{iconOnly ? <IconFilter size={16} /> : text}
		</Button>
	);
}
