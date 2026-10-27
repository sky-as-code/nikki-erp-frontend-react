import { Stack } from '@mantine/core';
import { resourceCommand } from '@nikkierp/common/dynamicModel';
import { InsufficientPermissionContent, LoadingState } from '@nikkierp/ui/components';
import { ExcelDataTable } from '@nikkierp/ui/components/ExcelDataTable';
import React from 'react';

import {
	FORM_DATA_TABLE_PAGE_SIZE, formDataTableRequest, isFormDataTablePaginated,
} from './formDataTableModel';
import { getSearchRequestOrderBy } from '../../data/searchRequest';
import { useResourceSearch } from '../../data/useResourceSearch';
import { useTableRelatedSchemas } from '../../data/useTableFieldLabels';
import { useDefaultTableHotKeys } from '../../pages/resourceSplitView/splitViewContext';
import { resourceTestIdPrefix } from '../../testIds';
import { useResourceFormView } from '../resourceFormViewContext';

import type * as dyn from '@nikkierp/common/dynamicModel';
import type {
	ExcelDataTableRowFeatureProps, ExcelDataTableRowWriteProps, SearchItem, SelectionMode,
} from '@nikkierp/ui/components/ExcelDataTable';
import type { FieldRendererMap } from '@nikkierp/viewengine/core';


export type FormDataTableProps = ExcelDataTableRowWriteProps & ExcelDataTableRowFeatureProps & {
	schemaName: string,
	/** Defaults to the schema's generic `core.resource.{schemaName}.search`. */
	searchCommand?: string,
	searchName?: string,
	/** Scopes the rows to the form's record; changing it starts the table afresh. */
	baseGraph?: dyn.SearchGraph,
	/** Requested columns, in order. Read on mount. */
	fields: string[],
	/** Lists archived rows beside active ones (`include_archived`). Read on mount: re-key to change it. */
	includeArchived?: boolean,
	/**
	 * Rewrites the loaded rows before they are shown, e.g. to merge a form's unsaved drafts.
	 * Keep it stable (`useCallback`): a fresh function re-runs it every render.
	 */
	transformItems?: (items: SearchItem[]) => SearchItem[],
	/** Puts the column settings button in the filler header; off by default. */
	enableSettings?: boolean,
	indexColumnVisible?: boolean,
	/**
	 * Off to keep the pagination free of `Alt+P`/`Alt+←`/`Alt+→`. Defaults to on, except in a split
	 * view's detail pane, where the list beside it owns those keys.
	 */
	enableHotKeys?: boolean,
	selectionMode?: SelectionMode,
	onSelectionChange?: (selected: SearchItem[]) => void,
	translationNs?: string,
	/** Defaults to the schema label, `$ref` resolved against the module owning the field. */
	translateFieldName?: (field: string) => string,
	fieldRenderers?: FieldRendererMap,
	buildLinkHref?: (item: SearchItem) => string,
	fillerColumnMinWidth?: number,
	/** Shown centred while the table has no rows; defaults to the table's "No data". */
	emptyMessage?: string,
	testId?: string,
};

/**
 * An `ExcelDataTable` for one section of a detail form: 100 rows a page, with pagination above and
 * below only when there are more, and no column filters. Row writes follow the form's mode, passed as
 * the table's `updateMode`: offered while it is being updated (and on a create page, which has no
 * read mode), read-only otherwise. An `updateScope='table'` table edits every row inline in that mode.
 */
export function FormDataTable(props: FormDataTableProps): React.ReactNode {
	return <ScopedFormDataTable key={JSON.stringify(props.baseGraph ?? null)} {...props} />;
}

function ScopedFormDataTable(props: FormDataTableProps): React.ReactNode {
	const {
		schemaName, searchCommand: _command, searchName: _name, fields: _fields, includeArchived: _archived,
		transformItems, enableSettings, fillerColumnMinWidth, ...providerProps
	} = props;
	const updateMode = (useResourceFormView()?.updateMode ?? true) && props.updateMode !== false;
	const search = useFormDataTableSearch(props);
	const { pack, searchData } = search;
	const relatedSchemas = useTableRelatedSchemas(
		pack?.modelSchema, searchData?.desired_fields,
	);
	const data = React.useMemo(
		() => (searchData && transformItems ? { ...searchData, items: transformItems(searchData.items) } : searchData),
		[searchData, transformItems],
	);
	const testId = resourceTestIdPrefix({ testId: props.testId, schemaName, part: 'Table' });
	const defaultHotKeys = useDefaultTableHotKeys();

	if (search.refused) {
		return <InsufficientPermissionContent missing={search.refused} />;
	}
	if (!pack || !data) {
		return <LoadingState />;
	}
	return (
		<ExcelDataTable.Provider
			{...providerProps}
			updateMode={updateMode}
			enableHotKeys={props.enableHotKeys ?? defaultHotKeys}
			testId={testId}
			tableName={schemaName}
			modelSchema={pack.modelSchema}
			relatedSchemas={relatedSchemas}
			data={data}
			isLoading={search.isPending}
			initialSearchRequest={search.userRequest}
			pageSize={FORM_DATA_TABLE_PAGE_SIZE}
			onSearchRequestChange={search.onSearchRequestChange}
			orderBy={getSearchRequestOrderBy(search.searchRequest)}
			onRefresh={search.refresh}
		>
			<FormDataTableLayout
				paginated={isFormDataTablePaginated(searchData?.total)}
				enableSettings={enableSettings}
				fillerColumnMinWidth={fillerColumnMinWidth}
			/>
		</ExcelDataTable.Provider>
	);
}

type FormDataTableLayoutProps = Pick<FormDataTableProps, 'enableSettings' | 'fillerColumnMinWidth'> & {
	paginated: boolean,
};

function FormDataTableLayout({
	paginated, enableSettings, fillerColumnMinWidth,
}: FormDataTableLayoutProps): React.ReactNode {
	// The keys stay on the top copy only: one key held by two buttons shows two badges.
	const pagination = (hotKeys: boolean) => (paginated
		? <ExcelDataTable.Toolbar right={<ExcelDataTable.Pagination enableHotKeys={hotKeys ? undefined : false} />} />
		: null);
	return (
		<Stack gap='xs'>
			{pagination(true)}
			<div>
				<ExcelDataTable.TableHeader
					enableColumnFilters={false}
					fillerColumnMinWidth={fillerColumnMinWidth}
					{...(enableSettings ? { renderFillerColumnHeader: renderSettingsButton } : {})}
				/>
				<ExcelDataTable.Table />
			</div>
			{pagination(false)}
		</Stack>
	);
}

function renderSettingsButton(): React.ReactNode {
	return <ExcelDataTable.SettingsButton />;
}

function useFormDataTableSearch(props: FormDataTableProps) {
	const { schemaName, fields, newRowSearchField, searchName, includeArchived } = props;
	const initialRequest = React.useMemo(
		() => formDataTableRequest(fields, newRowSearchField, searchName, includeArchived),
		[fields, newRowSearchField, searchName, includeArchived],
	);
	return useResourceSearch({
		schemaName,
		searchCommand: props.searchCommand ?? resourceCommand(schemaName, 'search'),
		initialRequest,
		baseGraph: props.baseGraph,
		withEdgeLabels: true,
	});
}
