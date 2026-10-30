import { useId } from '@mantine/hooks';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { fieldErrorText } from './fieldErrors';
import { BaseFieldWrapper } from './fields';
import { useFieldData, useFormField } from './formContext';
import { useFormTestIdPrefix } from './formTestIds';
import { recordLabelOf, useRecordSearchOptions } from './recordSearchOptions';
import { RelationPickerModal } from './RelationPickerModal';
import { useCommand } from '../../hookhoc/useCommand';
import { useTranslate } from '../../i18n';
import { SelectDefaultsContext } from '../SearchableSelect/dropdownWidth';
import { DEFAULT_MAX_OPTIONS } from '../SearchableSelect/optionLimit';
import { SearchableSelect } from '../SearchableSelect/SearchableSelect';

import type { RecordSearchScope } from './recordSearchOptions';
import type { LocalizeFn } from '../../i18n';
import type { SearchItem, SelectionMode } from '../ExcelDataTable';
import type { SelectProps } from '../Select';



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
 * Per-field narrowing of the relation selects below it, by form field name: what the typed term
 * matches and which records may be offered at all. Absent, a select searches its target schema's
 * record label over every record. The picker modal browses within the same `graph`.
 */
export const RelationSearchScopeContext = React.createContext<Record<string, RecordSearchScope>>({});

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
	const { contentWidthDropdown } = React.useContext(SelectDefaultsContext);
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
			error={options.loadError ?? fieldErrorText(localize, fieldData)}
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
							formField
							// A table row's select opens wider than its cell; a form field matches its input.
							dropdownWidth={contentWidthDropdown ? undefined : 'target'}
							value={(field.value as string) ?? null}
							onChange={val => field.onChange(val === '' ? undefined : val)}
							// Null, not undefined: an update must tell the server to clear the reference.
							clearable={!fieldData.isRequired}
							onClear={() => field.onChange(null)}
							onBlur={field.onBlur}
							maxOptions={DEFAULT_MAX_OPTIONS}
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
								onClose={() => {
									setIsPickerOpen(false);
									field.onBlur();
								}}
								destSchemaName={options.destSchemaName}
								selectionMode={options.selectionMode}
								selectedIds={field.value ? [String(field.value)] : []}
								baseGraph={options.scopeGraph}
								testId={fieldTestId}
								onSelect={(items: SearchItem[]) => {
									field.onChange(String(items[0].id));
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
	/** How many referenced records the field holds, from its relation's cardinality. */
	selectionMode: SelectionMode,
	scopeGraph?: dyn.SearchGraph,
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
	const scope = React.useContext(RelationSearchScopeContext)[fieldName];
	const search = useRecordSearchOptions(destSchemaName, term, localize, undefined, scope);
	const { labelField, subLabelField, options: pageOptions } = search;
	const selectedId = useWatch({ control, name: fieldName }) as string | undefined;
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
		selectionMode: relationSelectionMode(relation),
		scopeGraph: scope?.graph,
	};
}

/**
 * A field that owns the foreign key points at one record; a to-many relation holds several. Today
 * only owning (many:one / one:one) relations reach this field, so `multiple` is the case a future
 * to-many field will hit, not one this field produces yet.
 */
export function relationSelectionMode(relation: dyn.ModelSchemaRelation | undefined): SelectionMode {
	const type = relation?.relation_type;
	return type === 'one:many' || type === 'many:many' ? 'multiple' : 'single';
}

type SelectedLabelOptions = {
	destSchemaName: string,
	selectedId?: string,
	labelField: string,
	subLabelField?: string,
	isOnPage: boolean,
	localize: LocalizeFn,
};

/**
 * The record a `GET_BY_ID` answered: the response wraps it as `{item, meta}`. Reading the wrapper as
 * the record labelled every off-page selection "undefined" (its missing `id`).
 */
export function fetchedRecordOf(
	data: dyn.RestGetOneResponse<Record<string, any>> | null | undefined,
): Record<string, any> | undefined {
	return data?.item ?? undefined;
}

/** The option for an already-selected record the current search page does not include. */
function useSelectedLabel(opts: SelectedLabelOptions): { value: string, label: string } | undefined {
	const { destSchemaName, selectedId, isOnPage } = opts;
	const command = destSchemaName ? dyn.resourceCommands(destSchemaName).GET_BY_ID : '';
	const getById = useCommand<dyn.RestGetOneResponse<Record<string, any>>>(command);
	const publish = getById.publish;
	// Ids already looked up, so a re-render or a new search page never refetches the same record.
	const resolved = React.useRef(new Map<string, string>());
	const [, forceRender] = React.useState(0);

	React.useEffect(() => {
		if (!selectedId || !destSchemaName || isOnPage || resolved.current.has(selectedId)) {
			return;
		}
		void publish({ id: selectedId }).then(response => {
			const record = fetchedRecordOf(response.result?.data);
			if (record) {
				resolved.current.set(
					selectedId, recordLabelOf(record, opts.labelField, opts.subLabelField, opts.localize),
				);
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
