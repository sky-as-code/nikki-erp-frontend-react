import { Select } from '@mantine/core';
import { useDebouncedValue, useId } from '@mantine/hooks';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { BaseFieldWrapper } from './fields';
import { useFieldData, useFormField } from './formContext';
import { useFormTestIdPrefix } from './formTestIds';
import { RelationPickerModal } from './RelationPickerModal';
import { useCommand } from '../../hookhoc/useCommand';
import { useDynamicModel } from '../../hookhoc/useDynamicModel';
import { useTranslate } from '../../i18n';
import { SearchableSelect } from '../SearchableSelect/SearchableSelect';

import type { LocalizeFn } from '../../i18n';
import type { SearchItem } from '../DataTable/types';


const SEARCH_DEBOUNCE_MS = 300;
/**
 * What `useLocalize` returns for a LangJson carrying no entry for the active language. i18n is
 * configured without a fallback language so gaps are visible, but a field description is the wrong
 * place to surface one — an empty description reads better than a placeholder token.
 */
const MISSING_TRANSLATION = '$missing.translation';
const PAGE_SIZE = 20;
/** `*` is the contains operator; see `SearchOperator` in `@nikkierp/common/dynamicModel`. */
const CONTAINS = '*';

type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;

export type RelationSelectFieldProps = {
	name: string,
	inputProps?: Partial<SelectProps>,
	localize: LocalizeFn,
	/**
	 * Field name of the peer, in the same exclusive group, that currently holds a value.
	 * Set means this field is disabled because only one member of the group may be filled.
	 */
	exclusiveDisabledBy?: string,
};

/**
 * Picks a related record for a `ulid` foreign-key field, searching the target resource through the
 * command bus as the user types.
 *
 * Everything it needs comes from the schema: the field's own `to_relations` entry names the target
 * schema, whose `record_label_field` names the text to show. Nothing is hardcoded per resource, so
 * a new relation renders correctly with no page-metadata change.
 *
 * The dropdown's own debounced typeahead (fast top-N match) is the default interaction; its action
 * item opens a `RelationPickerModal` — a full searchable/filterable/paginated table of the
 * referenced schema — as the "browse everything" escape hatch, not a replacement for typing.
 */
export function RelationSelectField(props: RelationSelectFieldProps): React.ReactNode {
	const { name, localize } = props;
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelLoading } = useFormField();
	const [term, setTerm] = React.useState('');
	const [isPickerOpen, setIsPickerOpen] = React.useState(false);
	const options = useRelationOptions(name, term, localize);
	const testIdPrefix = useFormTestIdPrefix();
	const fieldTestId = testIdPrefix ? `${testIdPrefix}.field.${name}` : undefined;
	const t = useTranslate('common');
	const isDisabled = Boolean(
		modelLoading || props.inputProps?.disabled
		|| props.exclusiveDisabledBy || options.loadError,
	);

	if (!fieldData) {
		return null;
	}

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={localize(fieldData.label)}
			// Uncomment to show sub-labels
			// description={translatedOrEmpty(localize(fieldData.description))}
			isRequired={fieldData.isRequired}
			error={options.loadError ?? localize(fieldData.error as any)}
		>
			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<>
						<SearchableSelect
							items={options.data}
							// An input, not a filled button: this stands in for a form field and
							// must match the inputs beside it, not paint in the theme's accent.
							variant='input'
							dropdownWidth='target'
							value={(field.value as string) ?? null}
							onChange={val => field.onChange(val === '' ? undefined : val)}
							onSearchChange={setTerm}
							// Always on: the search box triggers server-side search, not just a
							// filter over an already-fetched list, so it must show regardless of
							// how many rows the current page happens to hold.
							searchBoxEnabledAt={0}
							actionOptionLabel={options.destSchemaName ? t('action.browseAll') : undefined}
							onActionTrigger={isDisabled ? undefined : () => setIsPickerOpen(true)}
							searchPlaceholder={t('action.search')}
							unselectedPlaceholder={
								options.isPending ? t('messages.loading') : localize(fieldData.placeholder)
							}
							disabled={isDisabled}
							testId={fieldTestId}
						/>
						{options.destSchemaName ? (
							<RelationPickerModal
								opened={isPickerOpen}
								onClose={() => setIsPickerOpen(false)}
								destSchemaName={options.destSchemaName}
								localize={localize}
								selectedId={(field.value as string) ?? null}
								testId={fieldTestId}
								onSelect={(item: SearchItem) => {
									field.onChange(String(item.id));
								}}
							/>
						) : null}
					</>
				)}
			/>
		</BaseFieldWrapper>
	);
}

type RelationOptions = {
	data: Array<{ value: string, label: string }>,
	isPending: boolean,
	loadError?: string,
	/** Label of the option currently selected, so the caller can tell it apart from a typed term. */
	selectedLabel?: string,
	/** The referenced schema's own name, or empty until the field's relation resolves. */
	destSchemaName: string,
};

/**
 * Resolves the target schema, searches it, and keeps the currently selected record labelled.
 *
 * The search returns one page, which need not contain the record the form already points at, and
 * Mantine's `Select` drops a value missing from its data. So a selected id absent from the page is
 * fetched once by id and prepended, otherwise an existing record would open showing an empty box.
 */
function useRelationOptions(fieldName: string, term: string, localize: LocalizeFn): RelationOptions {
	const { crudSchema, control } = useFormField();
	const relation = crudSchema?.modelSchema
		? dyn.findRelationBySrcField(crudSchema.modelSchema, fieldName)
		: undefined;
	const destSchemaName = relation?.dest_schema_name ?? '';
	const targetPack = useDynamicModel(destSchemaName);
	const targetSchema = targetPack?.modelSchema;
	const labelField = targetSchema?.record_label_field ?? 'id';
	const subLabelField = targetSchema?.record_sub_label_field;

	const [debouncedTerm] = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);
	// Held back until the target schema resolves: searching before then would use the `id`
	// fallback for `labelField` and be immediately re-issued with the real one.
	const search = useSearchPage(
		targetSchema ? destSchemaName : '', debouncedTerm, labelField, subLabelField,
	);
	const selectedId = useWatch({ control, name: fieldName }) as string | undefined;
	const pageOptions = React.useMemo(
		() => (search.items ?? []).map(item => toOption(item, labelField, subLabelField, localize)),
		[search.items, labelField, subLabelField, localize],
	);
	const offPageOption = useSelectedLabel({
		destSchemaName, selectedId, labelField, subLabelField, localize,
		isOnPage: pageOptions.some(option => option.value === selectedId),
	});

	const data = offPageOption ? [offPageOption, ...pageOptions] : pageOptions;
	return {
		data,
		isPending: search.isPending,
		loadError: search.loadError,
		selectedLabel: data.find(option => option.value === selectedId)?.label,
		destSchemaName,
	};
}

type SearchPageResult = {
	items: Array<Record<string, any>> | null,
	isPending: boolean,
	loadError?: string,
};

function useSearchPage(
	destSchemaName: string, term: string, labelField: string, subLabelField?: string,
): SearchPageResult {
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
			size: PAGE_SIZE,
			fields,
			// Searching by id would be a prefix match on an opaque ULID, which no user types.
			graph: term && labelField !== 'id' ? { if: [labelField, CONTAINS, term] } : undefined,
		} satisfies dyn.RestSearchRequest);
	}, [publish, destSchemaName, term, labelField, subLabelField]);

	React.useEffect(() => {
		if (search.data?.items) {
			setCached(search.data.items);
		}
	}, [search.data]);

	return {
		items: search.data?.items ?? cached,
		isPending: search.isPending,
		loadError: search.error ? String(search.error) : undefined,
	};
}

type SelectedLabelOptions = {
	destSchemaName: string,
	selectedId?: string,
	labelField: string,
	subLabelField?: string,
	isOnPage: boolean,
	localize: LocalizeFn,
};

/** The option for an already-selected record the current search page does not include. */
function useSelectedLabel(opts: SelectedLabelOptions): { value: string, label: string } | undefined {
	const { destSchemaName, selectedId, isOnPage } = opts;
	const command = destSchemaName ? dyn.resourceCommands(destSchemaName).GET_BY_ID : '';
	const getById = useCommand<Record<string, any>>(command);
	const publish = getById.publish;
	// Ids already looked up, so a re-render or a new search page never refetches the same record.
	const resolved = React.useRef(new Map<string, string>());
	const [, forceRender] = React.useState(0);

	React.useEffect(() => {
		if (!selectedId || !destSchemaName || isOnPage || resolved.current.has(selectedId)) {
			return;
		}
		void publish({ id: selectedId }).then(response => {
			const record = response.result?.data;
			if (record) {
				resolved.current.set(selectedId, labelOf(record, opts.labelField, opts.subLabelField, opts.localize));
				forceRender(tick => tick + 1);
			}
		});
	}, [publish, selectedId, destSchemaName, isOnPage, opts.labelField, opts.subLabelField, opts.localize]);

	if (!selectedId || isOnPage) {
		return undefined;
	}
	// Falls back to the raw id while the lookup is in flight — truthful, and less jarring than a
	// box that looks empty.
	return { value: selectedId, label: resolved.current.get(selectedId) ?? selectedId };
}

function toOption(
	item: Record<string, any>, labelField: string, subLabelField: string | undefined, localize: LocalizeFn,
): { value: string, label: string } {
	return { value: String(item.id), label: labelOf(item, labelField, subLabelField, localize) };
}

/** A record's display text, with its secondary field in parentheses when the schema names one. */
function labelOf(
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
