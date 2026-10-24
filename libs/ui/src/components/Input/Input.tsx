import { Input as MantineInput } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import React from 'react';

import { withInputDensity } from './inputDensity';
import { toAriaKeyShortcuts, useShortcut } from '../../shortcuts';

import type { ShortcutSpec } from '../../shortcuts';
import type { InputProps as MantineInputProps, PolymorphicComponentProps } from '@mantine/core';


/** Props of the wrapper, generic over the element it renders as — `'input'` unless overridden. */
export type InputProps<C = 'input'> = PolymorphicComponentProps<C, MantineInputProps> & {
	/**
	 * `Alt+{shortcut}` focuses the input. Explicit only: an input never joins a `ShortcutSequence`,
	 * which numbers the buttons of an action bar.
	 */
	shortcut?: ShortcutSpec,
};

function InputBase<C = 'input'>({ size, classNames, shortcut, ...rest }: InputProps<C>): React.ReactElement {
	const { ref: forwardedRef, ...props } = rest as InputProps & { ref?: React.Ref<HTMLElement> };
	const ownRef = React.useRef<HTMLElement>(null);
	const ref = useMergedRef(forwardedRef, ownRef);
	useShortcut(ownRef, shortcut, { mode: 'focus', disabled: !!props.disabled });

	return (
		<MantineInput
			size={size ?? 'sm'}
			classNames={size ? classNames : withInputDensity(classNames)}
			{...props}
			ref={ref}
			aria-keyshortcuts={toAriaKeyShortcuts(shortcut) ?? props['aria-keyshortcuts']}
		/>
	);
}

/**
 * Mantine's `Input` at the app's standard density.
 *
 * `size='sm'` picks the small font size, while the box takes its height from the density token
 * `--nikki-control-height` (see {@link withInputDensity}), so the text never changes with density.
 * Both are defaults: a caller passing its own `size` gets that size's own height, and a `style`
 * or `h` still wins, being inline.
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
