import { useDebouncedValue } from '@mantine/hooks';
import React from 'react';

import { buildContainsSearchRequest } from './newRowModel';
import { useCommand } from '../../hookhoc/useCommand';
import { useDynamicModel } from '../../hookhoc/useDynamicModel';
import { useLocaleCollator, useSchemaLocalize } from '../../i18n';
import { toRecordOption, useRecordSearchOptions } from '../form/recordSearchOptions';

import type { NewRowConfig } from './context';
import type { LocalizeFn } from '../../i18n';
import type { RecordOption } from '../form/recordSearchOptions';
import type * as dyn from '@nikkierp/common/dynamicModel';


const SEARCH_DEBOUNCE_MS = 300;

export type NewRowSearch = {
	/** The matches, with the picked record kept in even once the term no longer matches it. */
	items: RecordOption[],
	isPending: boolean,
	/** Why the search could not answer; empty while it can. */
	failure: string | undefined,
	setTerm: (term: string) => void,
	pick: (value: string) => RecordOption | undefined,
};

/**
 * The record picker's options: the resource's own search by default, or `newRowSearchCommand` when
 * the page names one (a search scoped to what may be assigned, say). Both match the record label
 * with `contains`.
 */
export function useNewRowSearch(newRow: NewRowConfig): NewRowSearch {
	const schemaName = newRow.resourceSchema ?? '';
	const localize = useSchemaLocalize(schemaName);
	const [term, setTerm] = React.useState('');
	const [picked, setPicked] = React.useState<RecordOption | null>(null);
	const byCommand = Boolean(newRow.searchCommand);
	const bySchema = useRecordSearchOptions(byCommand ? '' : schemaName, term, localize);
	const viaCommand = useCommandSearchOptions(newRow.searchCommand ?? '', byCommand ? schemaName : '', term, localize);
	const search = byCommand ? viaCommand : bySchema;
	const failure = search.loadError ?? search.clientErrors.map(error => error.message || error.key).join(', ');
	const items = picked && !search.options.some(option => option.value === picked.value)
		? [picked, ...search.options]
		: search.options;
	const pick = (value: string) => {
		const option = items.find(item => item.value === value);
		setPicked(option ?? null);
		return option;
	};
	return { items, isPending: search.isPending, failure: failure || undefined, setTerm, pick };
}

type CommandSearchOptions = Pick<
	ReturnType<typeof useRecordSearchOptions>, 'options' | 'isPending' | 'loadError' | 'clientErrors'
>;

/** `useRecordSearchOptions`, with the search published to a page-named command instead. */
function useCommandSearchOptions(
	command: string, schemaName: string, term: string, localize: LocalizeFn,
): CommandSearchOptions {
	const target = useDynamicModel(schemaName);
	const targetSchema = target.pack?.modelSchema;
	const labelField = targetSchema?.record_label_field ?? 'id';
	const subLabelField = targetSchema?.record_sub_label_field;
	const [debouncedTerm] = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);
	// Held back until the schema resolves, which is what names the label field searched.
	const request = React.useMemo(
		() => (command && targetSchema ? buildContainsSearchRequest(debouncedTerm, labelField, subLabelField) : null),
		[command, targetSchema, debouncedTerm, labelField, subLabelField],
	);
	const search = useCommandSearchPage(command, request);
	const compareLocalized = useLocaleCollator();
	const options = React.useMemo(
		() => (search.items ?? [])
			.map(item => toRecordOption(item, labelField, subLabelField, localize))
			.sort((a, b) => compareLocalized(a.label, b.label)),
		[search.items, labelField, subLabelField, localize, compareLocalized],
	);
	return {
		options,
		isPending: target.isPending || search.isPending,
		loadError: target.error ?? search.loadError,
		clientErrors: search.clientErrors,
	};
}

function useCommandSearchPage(command: string, request: dyn.RestSearchRequest | null) {
	const search = useCommand<dyn.RestSearchResponse<Record<string, any>>>(command);
	const publish = search.publish;
	// The last page is kept so a request in flight does not blank the dropdown mid-typing.
	const [cached, setCached] = React.useState<Array<Record<string, any>> | null>(null);
	React.useEffect(() => {
		if (request) {
			void publish(request);
		}
	}, [publish, request]);
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
