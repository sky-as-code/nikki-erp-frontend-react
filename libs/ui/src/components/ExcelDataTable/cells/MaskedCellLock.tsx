import { ActionIcon } from '@mantine/core';
import { toDisplayedEntitlements } from '@nikkierp/common/entitlements';
import { IconLock } from '@tabler/icons-react';
import React from 'react';

import { useTranslate } from '../../../i18n';
import { useShowLockedFeature } from '../../ErrorState';


/**
 * A cell the caller may not read (`masked_fields`): a lock button in place of the value, whose click explains the
 * refusal in the permission modal. Locked, never blank, so the reader learns the value exists and what opens it.
 * The press is kept from the row, so it neither selects the row nor follows the row link.
 */
export function MaskedCellLock({ missing, testId }: { missing: string[], testId?: string }): React.ReactNode {
	const t = useTranslate('common');
	const showLocked = useShowLockedFeature();
	const message = t('permission.field_read_locked', { expression: toDisplayedEntitlements(missing).join(', ') });
	const stop = (event: React.SyntheticEvent): void => {
		event.stopPropagation();
	};
	return (
		<ActionIcon
			variant='subtle'
			color='gray'
			size='sm'
			aria-label={message}
			data-locked='true'
			data-testid={testId}
			onMouseDown={stop}
			onClick={(event) => {
				event.stopPropagation();
				event.preventDefault();
				showLocked(missing, message);
			}}
		>
			<IconLock size={14} aria-hidden />
		</ActionIcon>
	);
}
