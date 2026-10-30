import { getParsedComboboxData } from '@mantine/core';
import React from 'react';

import type { ComboboxData, ComboboxItem } from '@mantine/core';


type SelectChange<Value extends string> = (value: Value | null, option: ComboboxItem<Value>) => void;

export type AutoSelectItemInput<Value extends string> = {
	enabled: boolean,
	value: Value | null | undefined,
	defaultValue: Value | null | undefined,
	data: ComboboxData<Value> | undefined,
	onChange: SelectChange<Value> | undefined,
};

export type AutoSelectItemOutput<Value extends string> = {
	/** Present only when the hook took over an uncontrolled select; pass it as `value`. */
	value?: Value | null,
	onChange: SelectChange<Value> | undefined,
};

/** The first enabled option, groups flattened in display order. */
export function firstSelectableItem<Value extends string>(
	data: ComboboxData<Value> | undefined,
): ComboboxItem<Value> | undefined {
	for (const item of getParsedComboboxData<Value>(data)) {
		const options = 'group' in item ? item.items : [item];
		const found = options.find((option) => !option.disabled);
		if (found) return found;
	}
	return undefined;
}

function optionsSignature<Value extends string>(data: ComboboxData<Value> | undefined): string {
	return getParsedComboboxData<Value>(data)
		.flatMap((item) => ('group' in item ? item.items : [item]))
		.map((option) => option.value)
		.join('|');
}

/**
 * Picks the first option while the select holds no value. An uncontrolled select is turned into a
 * controlled one over local state, so the pick shows without the caller storing it.
 *
 * It fires once per distinct option list: a parent that ignores the change (keeps `null`) or a user
 * who clears the select is not overridden until the options change again (async load, a dependent
 * select re-fed after its parent changed).
 */
export function useAutoSelectItem<Value extends string>(
	{ enabled, value, defaultValue, data, onChange }: AutoSelectItemInput<Value>,
): AutoSelectItemOutput<Value> {
	const isControlled = value !== undefined;
	const [innerValue, setInnerValue] = React.useState<Value | null>(defaultValue ?? null);
	const lastPickRef = React.useRef<string | undefined>(undefined);
	const ownsValue = enabled && !isControlled;
	const current = isControlled ? value : innerValue;

	const handleChange = React.useCallback<SelectChange<Value>>((next, option) => {
		if (ownsValue) setInnerValue(next);
		onChange?.(next, option);
	}, [ownsValue, onChange]);

	React.useEffect(() => {
		if (!enabled || current != null) return;
		const first = firstSelectableItem(data);
		const signature = first && optionsSignature(data);
		if (!first || lastPickRef.current === signature) return;
		lastPickRef.current = signature;
		handleChange(first.value, first);
	}, [enabled, current, data, handleChange]);

	if (!enabled) return { onChange };
	return ownsValue ? { value: innerValue, onChange: handleChange } : { onChange: handleChange };
}
