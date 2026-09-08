import { IconLock } from '@tabler/icons-react';
import React from 'react';

import { useShowLockedFeature } from './LockedFeature';


export type LockedMenuItemProps = {
	'data-locked'?: 'true',
	c?: string,
	style?: React.CSSProperties,
	rightSection?: React.ReactNode,
	onClick?: (event: React.MouseEvent) => void,
};

/**
 * The props that turn a Mantine `Menu.Item` into a locked one: greyed, with a lock on the right,
 * still clickable.
 *
 * A hook rather than a component because `Menu.Item` and `NavLink` are Mantine's own and cannot be
 * wrapped without losing their menu behaviour. Deliberately never sets `disabled` — that would set
 * `pointer-events: none` and make the refusal unreachable.
 *
 * Returns an empty object when not locked, so a call site can spread it unconditionally.
 */
export function useLockedItemProps(
	locked: boolean | undefined, missing: string[] | undefined,
): LockedMenuItemProps {
	const showLocked = useShowLockedFeature();

	return React.useMemo(() => {
		if (!locked) {
			return {};
		}
		return {
			'data-locked': 'true',
			c: 'dimmed',
			style: { opacity: 0.6 },
			rightSection: React.createElement(IconLock, { size: 14 }),
			onClick: (event: React.MouseEvent) => {
				// Menu items are often links; without this the navigation wins.
				event.preventDefault();
				showLocked(missing ?? []);
			},
		};
	}, [locked, missing, showLocked]);
}
