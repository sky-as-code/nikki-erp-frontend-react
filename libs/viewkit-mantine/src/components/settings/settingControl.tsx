import { NumberInput, Switch } from '@mantine/core';
import { Input, Select } from '@nikkierp/ui/components';
import React from 'react';

import type { SettingItemData } from './settingsDataContext';
import type { ModelSchemaFieldDataTypeName } from '@nikkierp/common/dynamicModel';


export type SettingControlProps = {
	item: SettingItemData,
	/** The unsaved edit, or the loaded value when the user has not touched this setting. */
	value: unknown,
	onChange: (value: unknown) => void,
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
export function SettingControl({ item, value, onChange }: SettingControlProps): React.ReactNode {
	const disabled = !item.editable;
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
				size='sm'
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
				data={enumOptions(dataType?.options?.enumValues)}
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
 * The declared choices for an enum setting.
 *
 * `enumValues` is typed `unknown` on the schema, so it is narrowed rather than cast: a
 * declaration that is not a list of strings yields an empty select instead of throwing inside
 * the renderer.
 */
function enumOptions(enumValues: unknown): string[] {
	if (!Array.isArray(enumValues)) return [];
	return enumValues.filter((entry): entry is string => typeof entry === 'string');
}
