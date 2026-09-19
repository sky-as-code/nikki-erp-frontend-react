import { Collapse, Modal } from '@mantine/core';
import React from 'react';

import { useExcelDataTableContext } from './context';
import { FilterPanelView } from './filter/FilterPanelView';
import { useTranslate } from '../../i18n';

import type { FilterTree } from './filter/filterTree';


/**
 * The filter panel, opened by `FilterButton`. A collapsible strip above the table, so the user
 * sees the result take effect against the conditions that produced it; on a compact screen a
 * modal instead, where a strip would push the rows off the screen.
 */
export function FilterPanel() {
	const t = useTranslate('common');
	const { filterPane, isCompact } = useExcelDataTableContext();
	if (isCompact) {
		return (
			<Modal opened={filterPane.isOpen} onClose={filterPane.close} title={t('search.filters')} size='auto'>
				{/*
				  * Applying closes the modal, unlike the inline strip which stays open: a modal covers
				  * the rows, so leaving it up would hide the very result the user just asked for.
				  */}
				<ConnectedFilterPanel onApplied={filterPane.close} />
			</Modal>
		);
	}
	return (
		<Collapse expanded={filterPane.isOpen}>
			<ConnectedFilterPanel />
		</Collapse>
	);
}

function ConnectedFilterPanel({ onApplied }: { onApplied?: () => void }) {
	const context = useExcelDataTableContext();
	const { filters, applyFilters } = context;
	const onApply = React.useCallback((overrides?: { tree: FilterTree }) => {
		applyFilters(overrides);
		onApplied?.();
	}, [applyFilters, onApplied]);
	const onClear = React.useCallback(() => {
		filters.clearAll();
		context.setSearchRequest(prev => {
			const next = { ...prev, page: 0 };
			delete next.graph;
			delete next.include_archived;
			return next;
		});
	}, [context, filters]);
	return (
		<FilterPanelView
			modelSchema={context.modelSchema}
			displayedFields={context.fields}
			relatedSchemas={context.relatedSchemas}
			tree={filters.tree}
			onTreeChange={filters.setTree}
			orderBy={filters.orderBy}
			onOrderByChange={filters.setOrderBy}
			lossy={filters.lossy}
			includeArchived={filters.includeArchived}
			onIncludeArchivedChange={filters.setIncludeArchived}
			onApply={onApply}
			onClear={onClear}
			translateFieldName={context.translateFieldName}
			tid={context.tid}
		/>
	);
}
