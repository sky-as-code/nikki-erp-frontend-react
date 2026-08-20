import { Select as MantineSelect } from '@mantine/core';
import clsx from 'clsx';
import React from 'react';

import classes from './Select.module.css';

import type { SelectProps as MantineSelectProps } from '@mantine/core';


export type SelectProps<Value extends string = string> = MantineSelectProps<Value>;

type SelectClassNames = Record<string, string | undefined>;

/**
 * Adds the density class to the wrapper while preserving any `classNames` the caller passed.
 * Mantine also accepts a `classNames` *function*; that form is passed through untouched.
 */
function mergeClassNames(classNames: SelectProps['classNames']): SelectProps['classNames'] {
	if (typeof classNames === 'function') return classNames;
	const own = classNames as SelectClassNames | undefined;
	return { ...own, wrapper: clsx(classes.wrapper, own?.wrapper) } as SelectProps['classNames'];
}

/**
 * Mantine's `Select` at the app's standard density.
 *
 * Sized to match {@link Input} exactly — same `size='sm'` typography, same `--input-height-xs`
 * box — because the two sit side by side in filter rows and forms, where a half-step difference
 * in height between a text box and a dropdown is the kind of thing that reads as a bug.
 *
 * The dropdown is portalled and bottom-start aligned by default: a select inside a scrolling,
 * height-capped pane would otherwise clip its own menu against the pane's overflow.
 */
export function Select<Value extends string = string>(
	{ size, style, classNames, comboboxProps, ...rest }: SelectProps<Value>,
): React.ReactElement {
	return (
		<MantineSelect
			size={size ?? 'sm'}
			style={style}
			classNames={mergeClassNames(classNames)}
			comboboxProps={{ ...defaultComboboxProps, ...comboboxProps }}
			{...rest as SelectProps<Value>}
		/>
	);
}

const defaultComboboxProps = { withinPortal: true, position: 'bottom-start' as const };
