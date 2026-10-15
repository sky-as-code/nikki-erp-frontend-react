import { Button, Group, Modal, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { useCommand } from '../../hookhoc/useCommand';
import { useDynamicModel } from '../../hookhoc/useDynamicModel';
import { useSchemaLocalize, useTranslate } from '../../i18n';
import { ExcelDataTable } from '../ExcelDataTable';
import { LoadingState } from '../Loading';

import type { SearchData, SearchItem, SelectionMode } from '../ExcelDataTable';


const PAGE_SIZE = 50;

/**
 * `search_name: 'default'` asks the server for its default field set, which is what fills
 * `desired_fields` on the response — and `desired_fields` is what the table builds its columns
 * from. Omitting it yields rows with no header.
 *
 * A real `size` from the outset, unlike the `size: 0` stub a list page seeds: `RestApi.search`
 * resolves that stub locally with no HTTP call, relying on the table to rewrite it into the first
 * real request. This modal only mounts the table once it has data to show, so nothing would ever
 * perform that rewrite and the picker would spin forever.
 */
const INITIAL_REQUEST: dyn.RestSearchRequest = { page: 0, size: PAGE_SIZE, search_name: 'default' };

export type RelationPickerModalProps = {
	opened: boolean,
	onClose: () => void,
	/** The referenced schema's own name — not the field's, the edge's `dest_schema_name`. */
	destSchemaName: string,
	/**
	 * Whether the field holds one reference or several; the field decides from its relation's
	 * cardinality. `single` clamps the table so Ctrl/Shift cannot select a second row.
	 */
	selectionMode: SelectionMode,
	/** The values currently held by the field, so the picker opens with them pre-selected. */
	selectedIds?: string[],
	/** Fired with the rows the user confirmed via Apply. The modal closes itself afterwards. */
	onSelect: (items: SearchItem[]) => void,
	testId?: string,
};

/**
 * A full searchable/filterable/paginated table of a referenced schema's records, opened from a
 * `SearchableSelect`'s action item ("Browse all…") — the escape hatch for when the field's own
 * debounced typeahead is not enough to find the right row.
 *
 * Picking is **two-step**: clicking a row marks it (Ctrl/Shift add more in `multiple` mode), and
 * Apply commits it. A single click cannot
 * commit, because the table is also how the user reads and compares rows before deciding, and a
 * click that both selected and dismissed would make browsing impossible.
 *
 * Lives in `libs/ui`, not `libs/viewkit-mantine`: `RelationSelectField` (this modal's only caller)
 * is a lower layer than `viewkit-mantine`'s `useResourceSearch`, so paging state here is
 * self-contained rather than reusing that hook.
 *
 * It localizes against the *referenced* schema's module rather than the host page's, because the
 * schema's title and field labels are `$ref` keys owned by that module: a UoM picker opened from
 * an inventory page must read `essential_uom.label` out of `essential`, not `inventory`.
 */
export function RelationPickerModal(props: RelationPickerModalProps): React.ReactNode {
	const { destSchemaName, testId } = props;
	const t = useTranslate('common');
	const localize = useSchemaLocalize(destSchemaName);
	// Full-bleed on a phone, where 80% would waste the little width a table most needs.
	const isMobile = useMediaQuery('(max-width: 48em)');
	const { pack } = useDynamicModel(destSchemaName);
	const modelSchema = pack?.modelSchema;
	const [pendingItems, setPendingItems] = React.useState<SearchItem[]>([]);
	const { searchData, searchRequest, setSearchRequest } = usePickerSearch(destSchemaName, props.opened);
	// Without this the table falls back to the raw field name.
	const translateFieldName = React.useCallback(
		(field: string): string => localize(modelSchema?.fields[field]?.label) || field,
		[localize, modelSchema],
	);

	// Reopening starts clean: a picker left mid-selection on one field must not open another
	// field's picker with Apply already armed for an unrelated row.
	React.useEffect(() => {
		if (props.opened) {
			setPendingItems([]);
		}
	}, [props.opened, destSchemaName]);

	const onApply = (): void => {
		if (pendingItems.length > 0) {
			props.onSelect(pendingItems);
		}
		props.onClose();
	};

	return (
		<Modal
			opened={props.opened}
			onClose={props.onClose}
			size={isMobile ? '100%' : '80%'}
			title={localize(modelSchema?.label, { count: 99 })}
		>
			<Stack gap='md'>
				{/* Mounted only with data, and the modal unmounts its body on close: every opening
				    gets a fresh table, so the field's current value is re-seeded as the selection. */}
				{searchData && modelSchema ? (
					<ExcelDataTable.Provider
						testId={testId}
						tableName={destSchemaName}
						modelSchema={modelSchema}
						data={searchData}
						initialSearchRequest={searchRequest}
						onSearchRequestChange={setSearchRequest}
						translateFieldName={translateFieldName}
						selectionMode={props.selectionMode}
						initialSelectedIds={props.selectedIds}
						onSelectionChange={setPendingItems}
					>
						<Stack gap='xs'>
							<ExcelDataTable.Toolbar
								left={(
									<ExcelDataTable.Title
										render={ctx => localize(modelSchema.label, { count: ctx.data.total })}
									/>
								)}
								right={<><ExcelDataTable.FilterButton /><ExcelDataTable.Pagination /></>}
							/>
							<ExcelDataTable.FilterPanel />
							<div>
								<ExcelDataTable.TableHeader />
								<ExcelDataTable.Table className='max-h-[60vh]' />
							</div>
						</Stack>
					</ExcelDataTable.Provider>
				) : <LoadingState />}
				<Group justify='flex-end'>
					<Button variant='default' onClick={props.onClose}>
						{t('action.close')}
					</Button>
					<Button variant='filled' disabled={pendingItems.length === 0} onClick={onApply}>
						{t('action.apply')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}

type PickerSearch = {
	searchData: SearchData | null,
	searchRequest: dyn.RestSearchRequest,
	setSearchRequest: (request: dyn.RestSearchRequest) => void,
};

/** Runs the referenced schema's paged search while the picker is open. */
function usePickerSearch(destSchemaName: string, opened: boolean): PickerSearch {
	const searchCommandName = destSchemaName ? dyn.resourceCommands(destSchemaName).SEARCH : '';
	const search = useCommand<dyn.RestSearchResponse<SearchItem>>(searchCommandName);
	const publish = search.publish;
	const [searchRequest, setSearchRequest] = React.useState<dyn.RestSearchRequest>(INITIAL_REQUEST);
	const [cachedData, setCachedData] = React.useState<SearchData | null>(null);

	// Reopening starts clean, so a picker left mid-page does not open already paged in, or briefly
	// show the previous schema's rows against this one's columns.
	React.useEffect(() => {
		if (opened) {
			setSearchRequest(INITIAL_REQUEST);
			setCachedData(null);
		}
	}, [opened, destSchemaName]);

	/**
	 * What has already been asked for, so the same query is never published twice.
	 *
	 * `publish` clears `data` to null before each call, so a re-publish on every render is not
	 * merely wasteful — it re-enters the loading state forever and the table never receives rows.
	 * Comparing the serialized request is what makes the effect converge, since `searchRequest` is
	 * a fresh object each time the table reports a change.
	 */
	const publishedKeyRef = React.useRef<string | null>(null);

	React.useEffect(() => {
		if (!opened || !destSchemaName) {
			publishedKeyRef.current = null;
			return;
		}
		const key = `${destSchemaName}|${JSON.stringify(searchRequest)}`;
		if (publishedKeyRef.current === key) {
			return;
		}
		publishedKeyRef.current = key;
		void publish(searchRequest);
	}, [publish, opened, destSchemaName, searchRequest]);

	// Held across pending requests so paging does not blank the table back to a spinner, the same
	// reason `useResourceSearch` caches its last result.
	React.useEffect(() => {
		if (search.data) {
			setCachedData(search.data as SearchData);
		}
	}, [search.data]);

	return {
		searchData: (search.data as SearchData | null) ?? cachedData,
		searchRequest,
		setSearchRequest,
	};
}
