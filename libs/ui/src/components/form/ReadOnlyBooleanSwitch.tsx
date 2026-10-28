import { Switch } from '@mantine/core';
import React from 'react';


export type ReadOnlyBooleanSwitchProps = {
	value: unknown,
	id?: string,
	'aria-labelledby'?: string,
};

/**
 * A boolean shown, not edited: the same switch the edit form uses, frozen. Unset reads as off,
 * matching the table cell renderer, so a record never shows a placeholder where a toggle belongs.
 */
export function ReadOnlyBooleanSwitch(props: ReadOnlyBooleanSwitchProps): React.ReactNode {
	return (
		<Switch
			id={props.id}
			aria-labelledby={props['aria-labelledby']}
			readOnly
			tabIndex={-1}
			size='md'
			styles={READ_ONLY_SWITCH_STYLES}
			checked={normalizeBooleanValue(props.value)}
			onChange={noop}
		/>
	);
}

/** The theme gives every switch the hand cursor; a frozen one cannot be clicked, so it keeps the arrow. */
export const READ_ONLY_SWITCH_STYLES = { track: { cursor: 'default' } } as const;

function noop(): void {}

export function normalizeBooleanValue(rawValue: unknown): boolean {
	if (typeof rawValue === 'boolean') {
		return rawValue;
	}
	if (typeof rawValue === 'number') {
		return rawValue !== 0;
	}
	if (typeof rawValue === 'string') {
		const normalized = rawValue.trim().toLowerCase();
		return normalized === 'yes' || normalized === 'true' || normalized === '1';
	}
	return false;
}
