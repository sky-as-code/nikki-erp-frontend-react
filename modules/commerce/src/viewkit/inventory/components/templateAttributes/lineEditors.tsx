import { Badge, MultiSelect } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import {
	DEFAULT_MAX_OPTIONS, limitOptions, RelationPickerModal, SearchableSelect, withPillsInputDensity,
} from '@nikkierp/ui/components';
import React from 'react';
import { useController, useWatch } from 'react-hook-form';

import { ATTRIBUTE_FIELD, MODE_FIELD, VALUES_FIELD } from './attributeLineRows';
import {
	attributePickerGraph, mergePickedValues, selectableAttributes, selectableValues, valuePickerGraph,
} from './lineOptions';
import { attributeLabel, MODE_COLORS, TEST_ID_PREFIX, valueLabel } from './sectionText';
import { BROWSE_ALL, renderValueOption } from './valueOption';
import { PRODUCT_ATTRIBUTE_SCHEMA_NAME, PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME } from '../../../constants';

import type { AttributeCatalogue } from './attributeCatalogue';
import type { SectionText } from './sectionText';
import type { TemplateConfigDraft } from './templateConfigDrafts';
import type { ComboboxItem, ComboboxParsedItem, OptionsFilter } from '@mantine/core';
import type { NewRowFieldEditor, NewRowFieldEditorProps, SearchItem } from '@nikkierp/ui/components/ExcelDataTable';


/**
 * What the line editors read besides their row: they render inside the row's own form, which
 * cannot see the section's draft or catalogue.
 */
export type LineEditorState = {
	draft: TemplateConfigDraft,
	catalogue: AttributeCatalogue,
	text: SectionText,
	/** Loads the values of an attribute picked in the insert row, which no line names yet. */
	requestValues: (attributeId: string) => void,
};

export const LineEditorContext = React.createContext<LineEditorState | null>(null);

function useLineEditorState(): LineEditorState {
	const state = React.useContext(LineEditorContext);
	if (!state) {
		throw new Error('Line editors render inside LineEditorContext');
	}
	return state;
}

/**
 * The picker is portalled, but React still bubbles its key presses through this tree: without the
 * stop, Enter in the picker's search box would also confirm the row the editor sits in. Only while
 * it is open, so the select's own Enter still confirms the row.
 */
function KeyBoundary({ isPickerOpen, children }: {
	isPickerOpen: boolean, children: React.ReactNode,
}): React.ReactNode {
	return <div onKeyDown={isPickerOpen ? event => event.stopPropagation() : undefined}>{children}</div>;
}

/**
 * The insert row's attribute: the non-archived attributes no line holds yet, searchable, with
 * "Browse all…" opening the full attribute list under the same exclusion. A saved line's attribute
 * is never edited (`no_update`): another attribute is another line. Picking one clears the values,
 * which belonged to the previous attribute.
 */
function AttributeEditor({ field, form }: NewRowFieldEditorProps): React.ReactNode {
	const { draft, catalogue, text, requestValues } = useLineEditorState();
	const { field: input } = useController({ control: form.form.control, name: field });
	const [isPickerOpen, setIsPickerOpen] = React.useState(false);
	const current = typeof input.value === 'string' ? input.value : '';
	const items = selectableAttributes(catalogue, draft, current)
		.map(item => ({ value: item.id, label: attributeLabel(catalogue, item.id, text) }));
	const pickerGraph = React.useMemo(() => attributePickerGraph(draft), [draft]);
	const onChange = (next: string) => {
		if (next === current) {
			return;
		}
		requestValues(next);
		form.form.setValue(VALUES_FIELD, [], { shouldDirty: true });
		input.onChange(next);
	};
	return (
		<KeyBoundary isPickerOpen={isPickerOpen}>
			<SearchableSelect
				items={items}
				variant='input'
				value={current || null}
				onChange={onChange}
				onBlur={input.onBlur}
				searchBoxEnabledAt={0}
				searchPlaceholder={text.t('common:action.search')}
				unselectedPlaceholder={text.t('product_template_config_selectAttribute')}
				actionOptionLabel={text.t('common:action.browseAll')}
				onActionTrigger={() => setIsPickerOpen(true)}
				testId={`${TEST_ID_PREFIX}.attributeSelect`}
			/>
			<RelationPickerModal
				opened={isPickerOpen}
				onClose={() => setIsPickerOpen(false)}
				destSchemaName={PRODUCT_ATTRIBUTE_SCHEMA_NAME}
				selectionMode='single'
				selectedIds={current ? [current] : []}
				baseGraph={pickerGraph}
				onSelect={(picked: SearchItem[]) => onChange(String(picked[0].id))}
				testId={`${TEST_ID_PREFIX}.attributePicker`}
			/>
		</KeyBoundary>
	);
}

/** No `size`: the row's inline-controls scope sizes the box, like every other input in it. */
const VALUES_INPUT_CLASS_NAMES = withPillsInputDensity({});

/** Label matches, at most {@link DEFAULT_MAX_OPTIONS} of them, and "Browse all…" always last. */
const filterValueOptions: OptionsFilter = ({ options, search }) => {
	const term = search.toLowerCase().trim();
	const items = options.filter((option): option is ComboboxItem => 'value' in option);
	const matching = items.filter(option => option.value !== BROWSE_ALL && option.label.toLowerCase().includes(term));
	const browse: ComboboxParsedItem[] = items.filter(option => option.value === BROWSE_ALL);
	return [...limitOptions(matching, DEFAULT_MAX_OPTIONS), ...browse];
};

/**
 * The attribute's non-archived values, searchable, with "Browse all…" opening every value of the
 * attribute to pick several at once. A value archived after it was selected stays, but cannot be
 * picked anew. Picked values stay listed with a check mark; picking one again removes it.
 */
function ValuesEditor({ field, form }: NewRowFieldEditorProps): React.ReactNode {
	const { catalogue, text } = useLineEditorState();
	const { field: input } = useController({ control: form.form.control, name: field });
	const attributeId = useWatch({ control: form.form.control, name: ATTRIBUTE_FIELD }) as string | undefined;
	const [isPickerOpen, setIsPickerOpen] = React.useState(false);
	const selectedIds = Array.isArray(input.value) ? input.value.map(String) : [];
	const browseLabel = text.t('common:action.browseAll');
	const data = [
		...selectableValues(catalogue, attributeId ?? '', selectedIds)
			.map(value => ({ value: value.id, label: valueLabel(value, text), disabled: value.isArchived })),
		{ value: BROWSE_ALL, label: browseLabel },
	];
	const pickerGraph = React.useMemo(() => valuePickerGraph(attributeId ?? ''), [attributeId]);
	const onChange = (next: string[]) => {
		if (next.includes(BROWSE_ALL)) {
			setIsPickerOpen(true);
			return;
		}
		input.onChange(next);
	};
	const onPicked = (picked: SearchItem[]) => {
		input.onChange(mergePickedValues(catalogue, selectedIds, picked.map(item => String(item.id))));
	};
	return (
		<KeyBoundary isPickerOpen={isPickerOpen}>
			<MultiSelect
				classNames={VALUES_INPUT_CLASS_NAMES}
				searchable
				data={data}
				value={selectedIds}
				filter={filterValueOptions}
				hidePickedOptions={false}
				renderOption={renderValueOption}
				disabled={!attributeId}
				placeholder={selectedIds.length === 0 ? text.t('product_template_config_selectValues') : undefined}
				onChange={onChange}
				onBlur={input.onBlur}
				comboboxProps={{ withinPortal: true }}
				aria-label={text.t('product_template_config_values')}
				{...testAttrs(TEST_ID_PREFIX, 'valuesSelect')}
			/>
			{attributeId ? (
				<RelationPickerModal
					opened={isPickerOpen}
					onClose={() => setIsPickerOpen(false)}
					destSchemaName={PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME}
					selectionMode='multiple'
					selectedIds={selectedIds}
					baseGraph={pickerGraph}
					onSelect={onPicked}
					testId={`${TEST_ID_PREFIX}.valuesPicker`}
				/>
			) : null}
		</KeyBoundary>
	);
}

/** The insert row's mode: the picked attribute's, shown before the line exists. */
function ModePreview({ form }: NewRowFieldEditorProps): React.ReactNode {
	const { catalogue, text } = useLineEditorState();
	const attributeId = useWatch({ control: form.form.control, name: ATTRIBUTE_FIELD }) as string | undefined;
	const mode = catalogue.attributes.get(attributeId ?? '')?.mode;
	return mode ? <ModeBadge mode={mode} text={text} /> : null;
}

export function ModeBadge({ mode, text }: { mode: string, text: SectionText }): React.ReactNode {
	return (
		<Badge size='sm' variant='light' color={MODE_COLORS[mode] ?? 'gray'} {...testAttrs(TEST_ID_PREFIX, 'mode')}>
			{text.t(`variant_creation_mode.${mode}`)}
		</Badge>
	);
}

/**
 * Module level, so the table never remounts an editor (and loses its open dropdown) on a re-render.
 * A saved line edits its values only: its attribute is `no_update`.
 */
export const LINE_FIELD_EDITORS: Record<string, NewRowFieldEditor> = {
	[VALUES_FIELD]: ValuesEditor,
};

/** The insert row picks the attribute too, and previews the mode, which is read-only on a line. */
export const NEW_LINE_FIELD_EDITORS: Record<string, NewRowFieldEditor> = {
	...LINE_FIELD_EDITORS,
	[ATTRIBUTE_FIELD]: AttributeEditor,
	[MODE_FIELD]: ModePreview,
};
