import { Select as MantineSelect } from '@mantine/core';
import React from 'react';

import { withInputDensity } from '../Input/inputDensity';
import { contentWidthComboboxProps, SelectDefaultsContext } from '../SearchableSelect/dropdownWidth';

import type { SelectProps as MantineSelectProps } from '@mantine/core';


export type SelectProps<Value extends string = string> = MantineSelectProps<Value>;

/**
 * Mantine's `Select` at the app's standard density.
 *
 * Sized to match {@link Input} exactly — same `size='sm'` typography, same density-token box
 * ({@link withInputDensity}) — because the two sit side by side in filter rows and forms, where a
 * half-step difference in height between a text box and a dropdown is the kind of thing that reads
 * as a bug. A caller passing its own `size` gets that size's own height, again like {@link Input}.
 *
 * The dropdown is portalled and bottom-start aligned by default: a select inside a scrolling,
 * height-capped pane would otherwise clip its own menu against the pane's overflow.
 */
export function Select<Value extends string = string>(
	{ size, style, classNames, comboboxProps, ...rest }: SelectProps<Value>,
): React.ReactElement {
	const { contentWidthDropdown } = React.useContext(SelectDefaultsContext);
	const widthProps = contentWidthDropdown && comboboxProps?.width === undefined ? contentWidthComboboxProps : {};
	return (
		<MantineSelect
			size={size ?? 'sm'}
			style={style}
			classNames={size ? classNames : withInputDensity(classNames)}
			comboboxProps={{ ...defaultComboboxProps, ...widthProps, ...comboboxProps }}
			{...rest as SelectProps<Value>}
		/>
	);
}

const defaultComboboxProps = { withinPortal: true, position: 'bottom-start' as const };
