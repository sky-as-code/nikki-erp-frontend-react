import { Button as MantineButton } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import React from 'react';

import { useShowLockedFeature } from '../ErrorState';

import type { ButtonProps as MantineButtonProps, PolymorphicComponentProps } from '@mantine/core';


/** What a control needs to render, and explain, a permission it does not hold. */
export type LockedProps = {
	/**
	 * Renders the control greyed with a lock, while leaving it clickable. Deliberately NOT
	 * Mantine's `disabled`, which sets `pointer-events: none` — the refusal has to be reachable,
	 * or the user is told nothing about why the action is unavailable.
	 */
	locked?: boolean,
	/** The entitlements the caller lacks, shown in the refusal. */
	lockedMissing?: string[],
};

/**
 * Props of the wrapper, generic over the element it renders as — `'button'` unless a caller
 * passes `component`, which is how {@link LinkButton} renders an anchor through it.
 */
export type ButtonProps<C = 'button'> = PolymorphicComponentProps<C, MantineButtonProps> & LockedProps;

/**
 * Mantine's `Button` at the app's standard action-bar density.
 *
 * `variant='outline'` and `size='compact-md'` are the shape nearly every action button in the app
 * already spelled out by hand. Both stay overridable, so a primary action can still ask for
 * `variant='filled'` without reaching past this wrapper.
 *
 * `ref` rides along in `rest`: React 19 hands it to function components as an ordinary prop, and
 * `Menu.Target` clones its child with one to anchor the dropdown, so it has to reach Mantine.
 *
 * `locked` is orthogonal to `disabled`: a busy button is disabled and unclickable, a locked one is
 * greyed but still answers a click with the reason. A control can be both.
 */
export function Button<C = 'button'>(
	{ variant, size, locked, lockedMissing, ...rest }: ButtonProps<C>,
): React.ReactElement {
	const showLocked = useShowLockedFeature();
	const props = rest as ButtonProps;

	if (!locked) {
		return <MantineButton variant={variant ?? 'outline'} size={size ?? 'compact-md'} {...props} />;
	}

	return (
		<MantineButton
			variant={variant ?? 'outline'}
			size={size ?? 'compact-md'}
			{...props}
			data-locked='true'
			c='dimmed'
			style={{ opacity: 0.6, ...(props.style as React.CSSProperties) }}
			rightSection={<IconLock size={14} />}
			onClick={event => {
				// The anchor case: LinkButton renders a real <a>, which would navigate away before
				// the refusal is ever seen.
				event.preventDefault();
				showLocked(lockedMissing ?? []);
			}}
		/>
	);
}
