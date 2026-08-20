import { Select, TextInput } from '@mantine/core';
import React from 'react';

import { getEnumOptions, getFilterInputKind, isNoValueOperator } from './filterModel';
import { useTranslate } from '../../i18n';

import type { FilterInputKind } from './filterModel';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { TestIdAttributes } from '@nikkierp/common/utils';


/** How long typing pauses before a text value is committed and a search fires. */
export const filterInputDebounceMs = 400;

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
	size?: 'xs' | 'sm',
	variant?: 'default' | 'unstyled',
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

/** Whether an operator's value input should be hidden entirely. */
export function shouldHideValueInput(operator: dyn.SearchOperator): boolean {
	return isNoValueOperator(operator);
}

function TextFilterInput(props: FilterValueInputProps): React.ReactNode {
	const { value, onChange, onCommit } = props;
	const commitRef = React.useRef(onCommit);
	commitRef.current = onCommit;
	const committedRef = React.useRef(value);

	// Debounced so a search is not published on every keystroke. The timer is keyed to the
	// latest value via the effect's dependency, so each edit restarts the wait rather than
	// letting an earlier keystroke's timer commit a stale string.
	//
	// The guard is what keeps this from firing on mount: the effect runs once with the initial
	// value, and committing that would publish a search for a filter the user never typed —
	// on every table render that mounts a row of these.
	React.useEffect(() => {
		if (value === committedRef.current) {
			return;
		}
		const timer = setTimeout(() => {
			committedRef.current = value;
			commitRef.current(value);
		}, filterInputDebounceMs);
		return () => clearTimeout(timer);
	}, [value]);

	// Both paths record what they committed, so the debounce guard above stays in step: a value
	// applied by Enter must not be re-applied by a later timer, and clearing with Escape must
	// still allow retyping the same text afterwards.
	const commitNow = (next: string) => {
		committedRef.current = next;
		onCommit(next);
	};

	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			// Enter is an explicit "apply now", so it must not wait out the debounce.
			event.preventDefault();
			commitNow(value);
			return;
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			onChange('');
			commitNow('');
		}
	};

	return (
		<TextInput
			value={value}
			onChange={event => onChange(event.currentTarget.value)}
			onKeyDown={onKeyDown}
			placeholder={props.placeholder}
			size={props.size ?? 'xs'}
			variant={props.variant ?? 'unstyled'}
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
			size={props.size ?? 'xs'}
			variant={props.variant ?? 'unstyled'}
			allowDeselect={false}
			comboboxProps={selectComboboxProps}
			className='w-full'
			{...props.testAttrs}
		/>
	);
}

const selectComboboxProps = { withinPortal: true, position: 'bottom-start' as const };
