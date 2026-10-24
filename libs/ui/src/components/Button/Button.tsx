import { Button as MantineButton } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import { IconLock } from '@tabler/icons-react';
import React from 'react';

import { toAriaKeyShortcuts, useControlShortcut } from '../../shortcuts';
import { useShowLockedFeature } from '../ErrorState';

import type { ShortcutSpec } from '../../shortcuts';
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
export type ButtonProps<C = 'button'> = PolymorphicComponentProps<C, MantineButtonProps> & LockedProps & {
	/**
	 * `Alt+{shortcut}` clicks the button. Without one, a button inside a `ShortcutSequence` is
	 * numbered by it.
	 */
	shortcut?: ShortcutSpec,
};

/**
 * Mantine's `Button` at the app's standard action-bar density.
 *
 * `variant='outline'` and `size='compact-md'` are the shape nearly every action button in the app
 * already spelled out by hand. Both stay overridable, so a primary action can still ask for
 * `variant='filled'` without reaching past this wrapper. Without a `size`, `compact-md` gives only
 * the font: height and padding come from the density tokens (see {@link withDensityVars}), so the
 * button shrinks with the inputs inside an inline-controls table row.
 *
 * `ref` rides along in `rest`: React 19 hands it to function components as an ordinary prop, and
 * `Menu.Target` clones its child with one to anchor the dropdown, so it has to reach Mantine.
 *
 * `locked` is orthogonal to `disabled`: a busy button is disabled and unclickable, a locked one is
 * greyed but still answers a click with the reason. A control can be both. A locked button keeps
 * its shortcut live for the same reason: the key clicks it, and the click shows the refusal.
 */
export function Button<C = 'button'>(
	{ variant, size, vars, locked, lockedMissing, shortcut, ...rest }: ButtonProps<C>,
): React.ReactElement {
	const showLocked = useShowLockedFeature();
	const { ref: forwardedRef, ...props } = rest as ButtonProps & { ref?: React.Ref<HTMLElement> };
	const ownRef = React.useRef<HTMLElement>(null);
	const ref = useMergedRef(forwardedRef, ownRef);
	const effectiveShortcut = useControlShortcut(ownRef, shortcut, { mode: 'click', disabled: !!props.disabled });
	const sizing = { size: size ?? 'compact-md', vars: size ? vars : withDensityVars(vars as ButtonVars | undefined) };
	const shortcutProps = { ref, 'aria-keyshortcuts': toAriaKeyShortcuts(effectiveShortcut) ?? props['aria-keyshortcuts'] };

	if (!locked) {
		return <MantineButton variant={variant ?? 'outline'} {...sizing} {...props} {...shortcutProps} />;
	}

	return (
		<MantineButton
			variant={variant ?? 'outline'}
			{...sizing}
			{...props}
			{...shortcutProps}
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

type ButtonVars = NonNullable<MantineButtonProps['vars']>;

/**
 * The box of the default size, from the density tokens: Mantine writes `--button-height` and
 * `--button-padding-x` inline from `size`, and a `vars` resolver is the one input merged after
 * its own. The fallbacks are `compact-md`'s values, for where the Shell's tokens are not loaded.
 * A caller's `h`, `p*`, `style` or `styles` still win: they set `height`/`padding` themselves.
 */
function withDensityVars(own: ButtonVars | undefined): ButtonVars {
	return (theme, props, ctx) => {
		const resolved = own?.(theme, props, ctx);
		return {
			...resolved,
			root: {
				'--button-height': 'var(--nikki-control-height, calc(1.875rem * var(--mantine-scale)))',
				'--button-padding-x': 'var(--nikki-control-padding-x, calc(0.625rem * var(--mantine-scale)))',
				...resolved?.root,
			},
		};
	};
}
