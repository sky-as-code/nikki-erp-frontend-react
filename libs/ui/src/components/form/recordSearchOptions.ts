import { useDebouncedValue } from '@mantine/hooks';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { useCommand } from '../../hookhoc/useCommand';
import { useDynamicModel } from '../../hookhoc/useDynamicModel';
import { useLocaleCollator } from '../../i18n';
import { searchPageSize } from '../SearchableSelect/optionLimit';

import type { LocalizeFn } from '../../i18n';
import type { ClientErrorItem } from '@nikkierp/common/types';


const SEARCH_DEBOUNCE_MS = 300;
/**
 * What `useLocalize` returns for a LangJson carrying no entry for the active language. i18n is
 * configured without a fallback language so gaps are visible, but a field description is the wrong
 * place to surface one — an empty description reads better than a placeholder token.
 */
const MISSING_TRANSLATION = '$missing.translation';
/** `*` is the contains operator; see `SearchOperator` in `@nikkierp/common/dynamicModel`. */
const CONTAINS = '*';

export type RecordOption = { value: string, label: string };

export type RecordSearchOptions = {
	/** One page of matches for the debounced term, sorted by the label the reader sees. */
	options: RecordOption[],
	isPending: boolean,
	/** A technical failure: the target schema never resolved, or the search threw. */
	loadError?: string,
	/** The server refused the search (validation, authorization). Empty otherwise. */
	clientErrors: ClientErrorItem[],
	labelField: string,
	subLabelField?: string,
};

/**
 * Searches a schema's records by its `record_label_field` as the user types, for a dropdown of
 * records: `RelationSelectField`, and any hand-written picker that composes `SearchableSelect`
 * with `RelationPickerModal` outside a form.
 */
export function useRecordSearchOptions(
	destSchemaName: string, term: string, localize: LocalizeFn, pageSize: number = searchPageSize(),
): RecordSearchOptions {
	const targetPack = useDynamicModel(destSchemaName);
	const targetSchema = targetPack.pack?.modelSchema;
	const labelField = targetSchema?.record_label_field ?? 'id';
	const subLabelField = targetSchema?.record_sub_label_field;
	const [debouncedTerm] = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);
	// Held back until the target schema resolves: searching before then would use the `id`
	// fallback for `labelField` and be immediately re-issued with the real one.
	const search = useSearchPage({
		destSchemaName: targetSchema ? destSchemaName : '', term: debouncedTerm, labelField, subLabelField, pageSize,
	});
	const compareLocalized = useLocaleCollator();
	// Sorted here rather than by the server, which stores the label as a LangJson and so cannot
	// order by the one language the reader sees.
	const options = React.useMemo(
		() => (search.items ?? [])
			.map(item => toRecordOption(item, labelField, subLabelField, localize))
			.sort((a, b) => compareLocalized(a.label, b.label)),
		[search.items, labelField, subLabelField, localize, compareLocalized],
	);
	return {
		options,
		isPending: targetPack.isPending || search.isPending,
		// A target schema that never resolves would otherwise leave an empty, innocuous-looking
		// dropdown, since the search is gated on it.
		loadError: targetPack.error ?? search.loadError,
		clientErrors: search.clientErrors,
		labelField,
		subLabelField,
	};
}

type SearchPageResult = {
	items: Array<Record<string, any>> | null,
	isPending: boolean,
	loadError?: string,
	clientErrors: ClientErrorItem[],
};

type SearchPageQuery = {
	destSchemaName: string,
	term: string,
	labelField: string,
	subLabelField?: string,
	/** The select's `maxOptions` as a page size (`searchPageSize`). */
	pageSize: number,
};

function useSearchPage(query: SearchPageQuery): SearchPageResult {
	const { destSchemaName, term, labelField, subLabelField, pageSize } = query;
	const command = destSchemaName ? dyn.resourceCommands(destSchemaName).SEARCH : '';
	const search = useCommand<dyn.RestSearchResponse<Record<string, any>>>(command);
	const publish = search.publish;
	// The last page is kept so a request in flight does not blank the dropdown mid-typing.
	const [cached, setCached] = React.useState<Array<Record<string, any>> | null>(null);

	React.useEffect(() => {
		if (!destSchemaName) {
			return;
		}
		// Deduplicated because `labelField` falls back to `id` on a schema that declares none,
		// which would otherwise ask for the same column twice.
		const fields = Array.from(new Set(['id', labelField, ...(subLabelField ? [subLabelField] : [])]));
		void publish({
			page: 0,
			size: pageSize,
			fields,
			// Searching by id would be a prefix match on an opaque ULID, which no user types.
			graph: term && labelField !== 'id' ? { if: [labelField, CONTAINS, term] } : undefined,
		} satisfies dyn.RestSearchRequest);
	}, [publish, destSchemaName, term, labelField, subLabelField, pageSize]);

	React.useEffect(() => {
		if (search.data?.items) {
			setCached(search.data.items);
		}
	}, [search.data]);

	return {
		items: search.data?.items ?? cached,
		isPending: search.isPending,
		loadError: search.error ? String(search.error) : undefined,
		clientErrors: search.clientErrors,
	};
}

export function toRecordOption(
	item: Record<string, any>, labelField: string, subLabelField: string | undefined, localize: LocalizeFn,
): RecordOption {
	return { value: String(item.id), label: recordLabelOf(item, labelField, subLabelField, localize) };
}

/** A record's display text, with its secondary field in parentheses when the schema names one. */
export function recordLabelOf(
	item: Record<string, any>, labelField: string, subLabelField: string | undefined, localize: LocalizeFn,
): string {
	const main = displayValue(item[labelField], localize) || String(item.id);
	const sub = subLabelField ? displayValue(item[subLabelField], localize) : '';
	return sub ? `${main} (${sub})` : main;
}

/**
 * A field value as text. A label field is either a LangJson object (`iam_group.name`) or a plain
 * string already in its final form (`iam_user.display_name`) — and the latter must not go through
 * `localize`, which would treat the value as a translation key and hand back `{namespace}:{value}`.
 */
function displayValue(value: unknown, localize: LocalizeFn): string {
	if (value === null || value === undefined) {
		return '';
	}
	if (typeof value === 'object') {
		const localized = localize(value as dyn.ModelSchemaLangJson);
		return localized === MISSING_TRANSLATION ? '' : localized;
	}
	return String(value);
}
