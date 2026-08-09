import { Button } from '@mantine/core';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconX } from '@tabler/icons-react';
import React from 'react';
import { Link } from 'react-router';

import { useResourceDetailTestAttrs, useResourceDetailTranslationNs } from './ResourceDetailProvider';
import { useIsSplitViewSecondary } from '../resourceSplitView/splitViewContext';


/**
 * Closes the detail pane by dropping the `:id` segment, which puts the split view
 * back into its list-only state. Renders nothing on a standalone detail page,
 * where there is no pane to close.
 */
export function SplitPaneCloseButton(): React.ReactNode {
	const isSplitPane = useIsSplitViewSecondary();
	const t = useTranslate(useResourceDetailTranslationNs());
	const tid = useResourceDetailTestAttrs();

	if (!isSplitPane) {
		return null;
	}

	return (
		<Button
			component={Link}
			to='..'
			relative='path'
			variant='subtle'
			size='compact-md'
			leftSection={<IconX size={16} />}
			{...tid('closePane')}
		>
			{t('action.close')}
		</Button>
	);
}
