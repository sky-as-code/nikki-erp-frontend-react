import { NumberInput, Switch } from '@mantine/core';
import { Input, Select, withInputDensity } from '@nikkierp/ui/components';
import React from 'react';

import { useEnumSettingOptions } from './enumSettingOptions';

import type { SettingItemData, SettingOption } from './settingsDataContext';
import type { ModelSchemaFieldDataTypeName } from '@nikkierp/common/dynamicModel';


/** The same box as the `Input` and `Select` wrappers beside it; `@nikkierp/ui` has no NumberInput one. */
const NUMBER_INPUT_CLASS_NAMES = withInputDensity({});


export type SettingControlProps = {
	item: SettingItemData,
	/** The unsaved edit, or the loaded value when the user has not touched this setting. */
	value: unknown,
	onChange: (value: unknown) => void,
	/** Labelled choices from the owning module; when present they win over the declared type. */
	options?: SettingOption[],
	/** The item's label key; the fallback prefix of an enum value's translation key. */
	labelKey?: string,
};

/**
 * The bound control for one setting, chosen from the field's declared data type.
 *
 * Deliberately not `AutoField`: that component resolves its value, its schema and its change
 * handler from a react-hook-form context and always draws its own label and description, which a
 * settings row has already rendered. Switching here on the same `data_type` union keeps the row's
 * layout and costs one small switch.
 *
 * Disabled state comes from `item.editable`, which the backend computes from the level and
 * `allow_override` together. It is never re-derived here: a locked setting shown as editable
 * lets a user submit a change the server then refuses.
 */
export function SettingControl({ item, value, onChange, options, labelKey }: SettingControlProps): React.ReactNode {
	const disabled = !item.editable;
	const enumOptions = useEnumSettingOptions(item, labelKey);
	if (options) {
		return (
			<Select
				w={220}
				data={withCurrentValue(options, value)}
				value={typeof value === 'string' ? value : null}
				disabled={disabled}
				onChange={next => onChange(next)}
			/>
		);
	}
	const dataType = item.field?.data_type;
	const typeName: ModelSchemaFieldDataTypeName = dataType?.name ?? 'string';

	if (typeName === 'boolean') {
		return (
			<Switch
				checked={value === true}
				disabled={disabled}
				onChange={event => onChange(event.currentTarget.checked)}
			/>
		);
	}

	if (typeName === 'int32' || typeName === 'int64' || typeName === 'decimal') {
		return (
			<NumberInput
				w={220}
				classNames={NUMBER_INPUT_CLASS_NAMES}
				value={typeof value === 'number' ? value : ''}
				disabled={disabled}
				allowDecimal={typeName === 'decimal'}
				// Matches `allowDecimal`: an integer setting showing a decimal keypad on a phone
				// invites a value the field will reject.
				inputMode={typeName === 'decimal' ? 'decimal' : 'numeric'}
				// A cleared box is absent, not zero. Zero is a legitimate stored value for these
				// settings, so the two must not collapse onto each other.
				onChange={next => onChange(next === '' ? null : Number(next))}
			/>
		);
	}

	if (typeName === 'enumString') {
		return (
			<Select
				w={220}
				data={withCurrentValue(enumOptions, value)}
				value={typeof value === 'string' ? value : null}
				disabled={disabled}
				onChange={next => onChange(next)}
			/>
		);
	}

	return (
		<Input
			w={220}
			value={typeof value === 'string' ? value : ''}
			disabled={disabled}
			type={typeName === 'secret' ? 'password' : 'text'}
			onChange={event => onChange(event.currentTarget.value)}
		/>
	);
}

/**
 * The choices, plus the current value when it is no longer one of them -- a language disabled after
 * it was stored, say. Dropping it would show an empty select that silently reads as "unset".
 */
function withCurrentValue(options: SettingOption[], value: unknown): SettingOption[] {
	if (typeof value !== 'string' || value === '' || options.some(option => option.value === value)) return options;
	return [...options, { value, label: value }];
}
