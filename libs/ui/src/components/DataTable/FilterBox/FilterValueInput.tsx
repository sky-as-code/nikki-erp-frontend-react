import React from 'react';

import { getEnumOptions, getFilterInputKind, isNoValueOperator } from './filterModel';
import { useTranslate } from '../../../i18n';
import { Input } from '../../Input';
import { Select } from '../../Select';

import type { FilterInputKind } from './filterModel';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { TestIdAttributes } from '@nikkierp/common/utils';


export type FilterValueInputProps = {
	kind: FilterInputKind,
	/** Enum choices, when `kind` is `enum`. */
	enumOptions?: string[],
	/** Raw text for text-ish kinds; the selected value for boolean and enum. */
	value: string,
	/** Fires on every keystroke for text-ish kinds, immediately for selects. */
	onChange: (value: string) => void,
	/** Fires when the value should be applied — debounce elapsed, Enter, or a select change. */
	onCommit: (value: string) => void,
	placeholder?: string,
	/** Translates an enum value to its label. Falls back to the raw value. */
	translateEnumValue?: (value: string) => string,
	/**
	 * When a free-text value is committed.
	 *
	 * Defaults to `enter`: a commit is the caller's signal to *act* on the value — publish a
	 * search — and no caller should start doing that per character by accident. `change` is the
	 * opt-in for a consumer that genuinely wants a commit on every keystroke.
	 */
	commitOn?: 'change' | 'enter',
	/**
	 * Whether Escape clears the box.
	 *
	 * On the column filter row it is the fastest way to drop one column's filter and re-search.
	 * In the condition panel the same key would silently destroy a value the user is still
	 * editing — nothing there has been sent yet, so there is nothing to undo — so it is opt-in.
	 */
	clearOnEscape?: boolean,
	disabled?: boolean,
	error?: boolean,
	testAttrs?: TestIdAttributes,
};

/**
 * The value control for one filter condition, chosen by the field's data type.
 *
 * Shared by the column filter row and the FilterBox condition rows so the two cannot drift:
 * a boolean is a tri-state select in both places, an enum offers the same choices in both, and
 * free text parses `{operator} {value}` identically because both hand the raw string to the
 * same parser.
 */
export function FilterValueInput(props: FilterValueInputProps): React.ReactNode {
	if (props.kind === 'boolean') {
		return <BooleanFilterInput {...props} />;
	}
	if (props.kind === 'enum') {
		return <EnumFilterInput {...props} />;
	}
	return <TextFilterInput {...props} />;
}

/**
 * A field's value input, resolved from its schema rather than a pre-computed kind.
 *
 * The convenience form for callers that hold a `ModelSchemaField`; it keeps the enum options
 * and the input kind derived from one place.
 */
export function SchemaFilterValueInput(
	props: Omit<FilterValueInputProps, 'kind' | 'enumOptions'> & {
		fieldSchema: dyn.ModelSchemaField | undefined,
	},
): React.ReactNode {
	const { fieldSchema, ...rest } = props;
	const kind = getFilterInputKind(fieldSchema);
	const enumOptions = React.useMemo(
		() => kind === 'enum' ? getEnumOptions(fieldSchema) : [],
		[kind, fieldSchema],
	);
	return <FilterValueInput {...rest} kind={kind} enumOptions={enumOptions} />;
}

/**
 * Whether a plain keystroke — not Enter — should commit the value.
 *
 * A commit is the caller's cue to publish a search, so this answers "does typing re-query?".
 * It must be false for the filter panel: there, typing only edits the condition tree and the
 * search waits for Enter or the Apply button. Only a consumer that explicitly asks for
 * `commitOn='change'` gets a commit per character.
 */
export function commitsOnKeystroke(commitOn: 'change' | 'enter' | undefined): boolean {
	return (commitOn ?? 'enter') === 'change';
}

/**
 * Whether this kind renders a free-text box rather than a select.
 *
 * Callers use it to tell a keystroke-driven commit (Enter, which the user chose) from a
 * select's change (which fires on the click itself). Kept next to the routing in
 * `FilterValueInput` so the two cannot disagree about which kinds get a `TextInput`.
 */
export function isKeyboardCommitKind(kind: FilterInputKind): boolean {
	return kind !== 'boolean' && kind !== 'enum';
}

/** Whether an operator's value input should be hidden entirely. */
export function shouldHideValueInput(operator: dyn.SearchOperator): boolean {
	return isNoValueOperator(operator);
}

function TextFilterInput(props: FilterValueInputProps): React.ReactNode {
	const { value, onChange, onCommit } = props;
	// No debounce: `change` mode commits with the keystroke and the caller decides what that
	// costs, while `enter` mode waits for an explicit key. A timer in between used to fire a
	// search 400ms into a half-typed `>= 100`.
	const commitPerKeystroke = commitsOnKeystroke(props.commitOn);

	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			// The element's own value, not `value`: in `change` mode the prop for this keystroke
			// may not have been re-rendered yet, and committing the stale one applies the filter
			// the user had a character ago.
			onCommit(event.currentTarget.value);
			return;
		}
		if (event.key === 'Escape' && props.clearOnEscape) {
			event.preventDefault();
			onChange('');
			onCommit('');
		}
	};

	return (
		<Input
			value={value}
			onChange={event => {
				const next = event.currentTarget.value;
				onChange(next);
				if (commitPerKeystroke) {
					onCommit(next);
				}
			}}
			onKeyDown={onKeyDown}
			placeholder={props.placeholder}
			disabled={props.disabled}
			error={props.error}
			className='w-full'
			{...props.testAttrs}
		/>
	);
}

function BooleanFilterInput(props: FilterValueInputProps): React.ReactNode {
	const t = useTranslate('common');
	const data = React.useMemo(() => [
		{ value: '', label: t('search.filterAll') },
		{ value: 'true', label: t('boolean.yes') },
		{ value: 'false', label: t('boolean.no') },
	], [t]);
	return <ChoiceFilterInput {...props} data={data} />;
}

function EnumFilterInput(props: FilterValueInputProps): React.ReactNode {
	const t = useTranslate('common');
	const translate = props.translateEnumValue;
	const data = React.useMemo(() => [
		{ value: '', label: t('search.filterAll') },
		...(props.enumOptions ?? []).map(option => ({
			value: option,
			label: translate ? translate(option) : option,
		})),
	], [props.enumOptions, translate, t]);
	return <ChoiceFilterInput {...props} data={data} />;
}

type ChoiceFilterInputProps = FilterValueInputProps & {
	data: Array<{ value: string, label: string }>,
};

/**
 * A select commits at once: there is no partially-typed state to wait out, and debouncing a
 * click would only delay the result the user already chose.
 */
function ChoiceFilterInput(props: ChoiceFilterInputProps): React.ReactNode {
	const { onChange, onCommit } = props;
	return (
		<Select
			data={props.data}
			value={props.value}
			onChange={next => {
				const resolved = next ?? '';
				onChange(resolved);
				onCommit(resolved);
			}}
			placeholder={props.placeholder}
			disabled={props.disabled}
			error={props.error}
			allowDeselect={false}
			className='w-full'
			{...props.testAttrs}
		/>
	);
}

