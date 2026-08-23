import { Input as MantineInput } from '@mantine/core';
import React from 'react';

import type { InputProps as MantineInputProps, PolymorphicComponentProps } from '@mantine/core';


/** Props of the wrapper, generic over the element it renders as — `'input'` unless overridden. */
export type InputProps<C = 'input'> = PolymorphicComponentProps<C, MantineInputProps>;

/** Pins the control one size step shorter than `size='sm'` alone would make it. */
const heightVar = { '--input-height': 'var(--input-height-xs)' } as React.CSSProperties;

function InputBase<C = 'input'>({ size, style, ...rest }: InputProps<C>): React.ReactElement {
	return <MantineInput size={size ?? 'sm'} style={[heightVar, style]} {...rest as InputProps} />;
}

/**
 * Mantine's `Input` at the app's standard density.
 *
 * `size='sm'` picks the small font size and horizontal padding, while `--input-height` is pinned
 * one step lower to `--input-height-xs`, so the control keeps `sm` typography in an `xs` box.
 * Both are defaults: a caller passing its own `size` or `style` still wins, since Mantine merges
 * a `style` array left to right.
 *
 * The sub-components are re-attached because callers reach `Input.Wrapper` and friends through
 * this same name; they are plain Mantine components, unaffected by the density defaults above.
 */
export const Input = Object.assign(InputBase, {
	Wrapper: MantineInput.Wrapper,
	Label: MantineInput.Label,
	Description: MantineInput.Description,
	Error: MantineInput.Error,
	Placeholder: MantineInput.Placeholder,
	ClearButton: MantineInput.ClearButton,
});
