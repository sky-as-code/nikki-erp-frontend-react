import { Button, Group, Modal, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { useCommand } from '../../hookhoc/useCommand';
import { useDynamicModel } from '../../hookhoc/useDynamicModel';
import { useTranslate } from '../../i18n';
import { DataTable } from '../DataTable/DataTable';
import { LoadingState } from '../Loading';

import type { LocalizeFn } from '../../i18n';
import type { SearchData, SearchItem } from '../DataTable/types';


const PAGE_SIZE = 50;

/**
 * `search_name: 'default'` asks the server for its default field set, which is what fills
 * `desired_fields` on the response — and `desired_fields` is what `DataTable` builds its columns
 * from. Omitting it yields rows with no header.
 *
 * A real `size` from the outset, unlike the `size: 0` stub a list page seeds: `RestApi.search`
 * resolves that stub locally with no HTTP call, relying on `DataTable` to rewrite it into the first
 * real request. This modal only mounts the table once it has data to show, so nothing would ever
 * perform that rewrite and the picker would spin forever.
 */
const INITIAL_REQUEST: dyn.RestSearchRequest = { page: 0, size: PAGE_SIZE, search_name: 'default' };

export type RelationPickerModalProps = {
	opened: boolean,
	onClose: () => void,
	/** The referenced schema's own name — not the field's, the edge's `dest_schema_name`. */
	destSchemaName: string,
	localize: LocalizeFn,
	/** The value currently held by the field, so reopening the picker shows it pre-selected. */
	selectedId?: string | null,
	/** Fired with the row the user confirmed via Apply. The modal closes itself afterwards. */
	onSelect: (item: SearchItem) => void,
	testId?: string,
};

/**
 * A full searchable/filterable/paginated table of a referenced schema's records, opened from a
 * `SearchableSelect`'s action item ("Browse all…") — the escape hatch for when the field's own
 * debounced typeahead is not enough to find the right row.
 *
 * Picking is **two-step**: clicking a row marks it, and Apply commits it. A single click cannot
 * commit, because the table is also how the user reads and compares rows before deciding, and a
 * click that both selected and dismissed would make browsing impossible.
 *
 * Lives in `libs/ui`, not `libs/viewkit-mantine`: `RelationSelectField` (this modal's only caller)
 * is a lower layer than `viewkit-mantine`'s `useResourceSearch`, so paging state here is
 * self-contained rather than reusing that hook.
 */
export function RelationPickerModal(props: RelationPickerModalProps): React.ReactNode {
	const { destSchemaName, localize, onSelect, testId } = props;
	const t = useTranslate('common');
	// Full-bleed on a phone, where 80% would waste the little width a table most needs.
	const isMobile = useMediaQuery('(max-width: 48em)');
	const pack = useDynamicModel(destSchemaName);
	const modelSchema = pack?.modelSchema;
	const searchCommandName = destSchemaName ? dyn.resourceCommands(destSchemaName).SEARCH : '';
	const search = useCommand<dyn.RestSearchResponse<SearchItem>>(searchCommandName);
	const publish = search.publish;
	const [searchRequest, setSearchRequest] = React.useState<dyn.RestSearchRequest>(INITIAL_REQUEST);
	const [pendingItem, setPendingItem] = React.useState<SearchItem | null>(null);
	const [cachedData, setCachedData] = React.useState<SearchData | null>(null);

	// Reopening starts clean: a picker left mid-page and mid-selection on one field must not open
	// another field's picker already paged in, pointing at an unrelated row, or briefly showing the
	// previous schema's rows against this one's columns.
	React.useEffect(() => {
		if (props.opened) {
			setSearchRequest(INITIAL_REQUEST);
			setPendingItem(null);
			setCachedData(null);
		}
	}, [props.opened, destSchemaName]);

	/**
	 * What has already been asked for, so the same query is never published twice.
	 *
	 * `publish` clears `data` to null before each call, so a re-publish on every render is not
	 * merely wasteful — it re-enters the loading state forever and the table never receives rows.
	 * Comparing the serialized request is what makes the effect converge, since `searchRequest` is
	 * a fresh object each time `DataTable` reports a change.
	 */
	const publishedKeyRef = React.useRef<string | null>(null);

	React.useEffect(() => {
		if (!props.opened || !destSchemaName) {
			publishedKeyRef.current = null;
			return;
		}
		const key = `${destSchemaName}|${JSON.stringify(searchRequest)}`;
		if (publishedKeyRef.current === key) {
			return;
		}
		publishedKeyRef.current = key;
		void publish(searchRequest);
	}, [publish, props.opened, destSchemaName, searchRequest]);

	// Held across pending requests so paging does not blank the table back to a spinner, the same
	// reason `useResourceSearch` caches its last result.
	React.useEffect(() => {
		if (search.data) {
			setCachedData(search.data as SearchData);
		}
	}, [search.data]);

	const searchData = (search.data as SearchData | null) ?? cachedData;
	const pendingId = pendingItem ? String(pendingItem.id) : props.selectedId;

	const onApply = (): void => {
		if (pendingItem) {
			onSelect(pendingItem);
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
				{searchData && modelSchema ? (
					<DataTable
						tableName={localize(modelSchema.label, { count: searchData.total })}
						data={searchData}
						initialSearchRequest={searchRequest}
						onSearchRequestChange={setSearchRequest}
						modelSchema={modelSchema}
						onSelectRow={setPendingItem}
						selectedRowId={pendingId ?? undefined}
						sortableFields={searchData.desired_fields}
						enableGridView={false}
						testId={testId}
					/>
				) : <LoadingState />}
				<Group justify='flex-end'>
					<Button variant='default' onClick={props.onClose}>
						{t('action.close')}
					</Button>
					<Button variant='filled' disabled={!pendingItem} onClick={onApply}>
						{t('action.apply')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
