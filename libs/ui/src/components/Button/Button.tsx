import { Button as MantineButton } from '@mantine/core';
import React from 'react';

import type { ButtonProps as MantineButtonProps, PolymorphicComponentProps } from '@mantine/core';


/**
 * Props of the wrapper, generic over the element it renders as — `'button'` unless a caller
 * passes `component`, which is how {@link LinkButton} renders an anchor through it.
 */
export type ButtonProps<C = 'button'> = PolymorphicComponentProps<C, MantineButtonProps>;

/**
 * Mantine's `Button` at the app's standard action-bar density.
 *
 * `variant='outline'` and `size='compact-md'` are the shape nearly every action button in the app
 * already spelled out by hand. Both stay overridable, so a primary action can still ask for
 * `variant='filled'` without reaching past this wrapper.
 *
 * `ref` rides along in `rest`: React 19 hands it to function components as an ordinary prop, and
 * `Menu.Target` clones its child with one to anchor the dropdown, so it has to reach Mantine.
 */
export function Button<C = 'button'>({ variant, size, ...rest }: ButtonProps<C>): React.ReactElement {
	return <MantineButton variant={variant ?? 'outline'} size={size ?? 'compact-md'} {...rest as ButtonProps} />;
}
