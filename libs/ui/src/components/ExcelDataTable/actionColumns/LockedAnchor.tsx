import { Anchor } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import React from 'react';

import { useShowLockedFeature } from '../../ErrorState';

import type { MantineSize } from '@mantine/core';


export type LockedAnchorProps = {
	label: React.ReactNode,
	missing: string[],
	testId: Record<string, string>,
	size?: MantineSize,
};

/** A link the caller may not follow: dimmed with a lock, and a click explains the refusal. */
export function LockedAnchor({ label, missing, testId, size = 'xs' }: LockedAnchorProps): React.ReactNode {
	const showLocked = useShowLockedFeature();
	return (
		<Anchor
			component='button'
			type='button'
			size={size}
			c='dimmed'
			data-locked='true'
			className='inline-flex items-center gap-1'
			onClick={() => showLocked(missing)}
			{...testId}
		>
			{label}
			<IconLock size={12} aria-hidden />
		</Anchor>
	);
}
